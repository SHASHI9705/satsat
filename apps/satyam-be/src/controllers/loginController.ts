import { Request, Response } from 'express';
import { getPrismaClient } from "../prismaClient";
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

console.log("REGION:", process.env.AWS_REGION);
console.log("ACCESS:", process.env.AWS_ACCESS_KEY_ID);
console.log("SECRET:", process.env.AWS_SECRET_ACCESS_KEY);

// Create a new login entry
export const createLogin = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { name, phone } = req.body;

    if (!name || !phone ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const login = await prisma.login.create({
      data: {
        name,
        phone,
        verified: false,
      },
    });

    res.status(201).json(login);
  } catch (error) {
    console.error('Error creating login:', error);
    res.status(500).json({ error: 'Failed to create login' });
  }
};

// Get all login entries
export const getAllLogins = async (_req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const logins = await prisma.login.findMany();
    res.status(200).json(logins);
  } catch (error) {
    console.error('Error fetching logins:', error);
    res.status(500).json({ error: 'Failed to fetch logins' });
  }
};

// Get a login entry by ID
export const getLoginById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { id } = req.params;
    const login = await prisma.login.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!login) {
      res.status(404).json({ error: 'Login not found' });
      return;
    }

    res.status(200).json(login);
  } catch (error) {
    console.error('Error fetching login:', error);
    res.status(500).json({ error: 'Failed to fetch login' });
  }
};

// Update a login entry
export const updateLogin = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { id } = req.params;
    const { name, phone, verified } = req.body;

    const login = await prisma.login.update({
      where: { id: parseInt(id, 10) },
      data: { name, phone, verified },
    });

    res.status(200).json(login);
  } catch (error) {
    console.error('Error updating login:', error);
    res.status(500).json({ error: 'Failed to update login' });
  }
};

// Delete a login entry
export const deleteLogin = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { id } = req.params;
    await prisma.login.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting login:', error);
    res.status(500).json({ error: 'Failed to delete login' });
  }
};

// Request OTP
export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone number are required' });
      return;
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Send OTP via AWS SNS
    const params = {
      Message: `Your OTP is ${otp}`,
      PhoneNumber: phone,
    };

    await sns.send(new PublishCommand(params));

    // Store OTP in the database
    const login = await prisma.login.upsert({
      where: { phone },
      update: { otp, name },
      create: { name, phone, otp, verified: false },
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const prisma = getPrismaClient();
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ error: 'Phone number and OTP are required' });
      return;
    }

    // Verify OTP
    const login = await prisma.login.findUnique({ where: { phone } });

    if (!login || login.verified || login.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // Mark as verified
    await prisma.login.update({
      where: { phone },
      data: { verified: true, otp: null },
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

