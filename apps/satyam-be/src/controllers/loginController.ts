import { Request, Response } from 'express';
import { getPrismaClient } from "../prismaClient";

// Handle Google login
export const handleGoogleLogin = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { email, name, photoURL } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Upsert login in the database
    const login = await prisma.login.upsert({
      where: { email },
      update: { name, photoURL },
      create: { email, name, photoURL },
    });

    console.log("Login object:", login);

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


