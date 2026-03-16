import { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getPrismaClient } from "../prismaClient";

// Extend Express Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Utility to upload files to S3
const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${folder}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
};

// Utility to delete files from S3
const deleteFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);
};

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB limit
});
export const uploadMiddleware: RequestHandler = upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'resumePdf', maxCount: 1 },
  { name: 'salarySlip', maxCount: 1 },
]);

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      fatherName,
      phone,
      email,
      address,
      experience,
      positionApplied,
      jobProfileLink,
      district,
    } = req.body;

    if (
      !name ||
      !fatherName ||
      !phone ||
      !email ||
      !address ||
      !experience ||
      !positionApplied ||
      !district
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const applicationId = `APP-${Date.now()}`; // Generate unique application ID

    const user = await getPrismaClient().user.create({
      data: {
        name,
        fatherName,
        phone,
        email,
        address,
        experience,
        positionApplied,
        jobProfileLink,
        district,
        applicationId,
        paid: false,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update a user by email
export const updateUser = async (req: Request<{ email: string }>, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const {
      name,
      fatherName,
      phone,
      address,
      experience,
      positionApplied,
      jobProfileLink,
      district,
      paid,
    } = req.body;

    const user = await getPrismaClient().user.update({
      where: { email },
      data: {
        name,
        fatherName,
        phone,
        address,
        experience,
        positionApplied,
        jobProfileLink,
        district,
        paid,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Update user payment status
export const updateUserPaymentStatus = async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;

    const user = await getPrismaClient().user.update({
      where: { email },
      data: { paid: true },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Delete a user by email
export const deleteUser = async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;
    await getPrismaClient().user.delete({
      where: { email },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get all users
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await getPrismaClient().user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get a user by email
export const getUserByEmail = async (req: Request<{ email: string }>, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const user = await getPrismaClient().user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

