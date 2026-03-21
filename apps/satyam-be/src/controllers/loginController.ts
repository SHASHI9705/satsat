import { Request, Response } from 'express';
import { getPrismaClient } from "../prismaClient";

// Handle OTP login
export const handleOtpLogin = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { phone, firstname, lastname } = req.body;

    if (!phone || !firstname || !lastname) {
      res.status(400).json({ error: 'Phone, firstname, and lastname are required' });
      return;
    }

    // Upsert user in the database
    const user = await prisma.user.upsert({
      where: { phone },
      update: { firstname, lastname },
      create: { phone, firstname, lastname },
    });

    console.log("User object:", user);

    // Set a cookie for the user
    res.cookie('user', user.phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error handling OTP login:', error);
    res.status(500).json({ error: 'Failed to handle OTP login' });
  }
};

// Fetch applications for a user
export const fetchApplications = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { userId },
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};


