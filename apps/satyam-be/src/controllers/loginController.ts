import { Request, Response } from 'express';
import { getPrismaClient } from "../prismaClient";

// Handle Google login
export const handleGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { email, phone, name, photoURL } = req.body;

    if (!email && !phone) {
      res.status(400).json({ error: 'Email or phone is required' });
      return;
    }

    // Upsert login in the database. Prefer email when available, otherwise use phone.
    let login;
    if (email) {
      login = await prisma.login.upsert({
        where: { email },
        update: { name, photoURL },
        create: { email, name, photoURL },
      });
    } else {
      // phone-based login: synthesize an email (schema requires email)
      const syntheticEmail = `${phone}@phone.local`;
      login = await prisma.login.upsert({
        where: { email: syntheticEmail },
        update: { name, photoURL },
        create: { email: syntheticEmail, name, photoURL },
      });
      // prisma Login model doesn't include `phone`. Keep `phone` in local
      // scope and avoid attaching it to the returned `login` object.
    }

    console.log("Login object:", login);

    // Set a server-side cookie so middleware can detect authenticated users.
    // Cookie is HttpOnly so it cannot be read by client-side JS.
    // Prefer explicit request `email` or `phone` values when available,
    // fallback to the stored `login.email` (which may be a synthetic email).
    const cookieValue = email || phone || login.email || '';
    res.cookie('user', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: 'Login successful', user: login });
  } catch (error) {
    console.error('Error handling Google login:', error);
    res.status(500).json({ error: 'Failed to handle Google login' });
  }
};

// Fetch applications for a user
export const fetchApplications = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const email = req.query.email as string;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const applications = await prisma.user.findMany({
      where: { email },
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};


