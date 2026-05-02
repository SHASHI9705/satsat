import { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getPrismaClient } from "../prismaClient";
import authMiddleware from '../middleware/corsMiddleware';

// Extend Express Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      user?: {
        id: string;
      };
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
  { name: 'salarySlip', maxCount: 1 }, // Salary slip remains optional as it is not mandatory
]);

// Create a new application
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Request body:', req.body);

    const { name, fatherName, gender, district, phone, email, address, experience, positionApplied, jobProfileLink } = req.body;

    if (!name.trim() || !fatherName.trim() || !gender?.trim() || !district?.trim() || !phone.trim() || !email.trim() || !address.trim() || !experience.trim() || !positionApplied.trim()) {
      res.status(400).json({ error: 'Missing or empty required fields' });
      return;
    }

    if (positionApplied === 'telecalling' && gender !== 'female') {
      res.status(400).json({ error: 'Telecalling is available only for female candidates' });
      return;
    }

    const isPaid = false; // Set `paid` to false explicitly

    const passportPhoto = Array.isArray(req.files) ? undefined : req.files?.passportPhoto?.[0];
    const resumePdf = Array.isArray(req.files) ? undefined : req.files?.resumePdf?.[0];
    const salarySlip = Array.isArray(req.files) ? undefined : req.files?.salarySlip?.[0];

    if (!passportPhoto || !resumePdf) {
      res.status(400).json({ error: 'Missing required files' });
      return;
    }

    // Validate file types and sizes
    const validateFile = (file: Express.Multer.File, allowedTypes: string[], maxSize: number) => {
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error(`Invalid file type: ${file.originalname}. Allowed types: ${allowedTypes.join(', ')}`);
      }
      if (file.size > maxSize) {
        throw new Error(`File too large: ${file.originalname}. Max size: ${maxSize / (1024 * 1024)} MB`);
      }
    };

    try {
      validateFile(passportPhoto, ['image/jpeg', 'image/png'], 5 * 1024 * 1024); // 5 MB limit
      validateFile(resumePdf, ['application/pdf'], 5 * 1024 * 1024); // 5 MB limit
      if (salarySlip) {
        validateFile(salarySlip, ['application/pdf', 'image/jpeg', 'image/png'], 5 * 1024 * 1024);
      }
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown validation error';
      res.status(400).json({ error: errorMessage });
      return;
    }

    const passportPhotoUrl = await uploadToS3(passportPhoto, 'passport-photos');
    const resumePdfUrl = await uploadToS3(resumePdf, 'resumes');
    const salarySlipUrl = salarySlip ? await uploadToS3(salarySlip, 'salary-slips') : undefined;

    const applicationId = `APP-${Date.now()}`; // Generate unique application ID

    const application = await getPrismaClient().application.create({
      data: {
        name,
        fatherName,
        gender,
        phone,
        email,
        address,
        experience,
        positionApplied,
        district,
        jobProfileLink,
        paid: isPaid,
        passportPhoto: passportPhotoUrl,
        resumePdf: resumePdfUrl,
        salarySlip: salarySlipUrl,
        applicationId,
        status: 'pending',
        user: {
          connect: {
            id: req.user?.id, // Use only `id` to connect the user
          },
        },
      },
    });

    res.status(201).json(application);
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
      status,
    } = req.body;

    const application = await getPrismaClient().application.update({
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
        status,
      },
    });

    res.status(200).json(application);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Update user payment status
export const updateUserPaymentStatus = async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;

    const application = await getPrismaClient().application.update({
      where: { email },
      data: { paid: true },
    });

    res.status(200).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Delete a user by email
export const deleteUser = async (req: Request<{ email: string }>, res: Response) => {
  try {
    const { email } = req.params;
    await getPrismaClient().application.delete({
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
    const applications = await getPrismaClient().application.findMany();
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get a user by email
export const getUserByEmail = async (req: Request<{ email: string }>, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const application = await getPrismaClient().application.findUnique({
      where: { email },
    });

    if (!application) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(application);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update application status by email
export const updateApplicationStatus = async (req: Request<{ email: string }>, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const updatedApplication = await getPrismaClient().application.update({
      where: { email },
      data: { status },
    });

    res.status(200).json(updatedApplication);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Update application payment status
export const updateApplicationPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Application ID is required' });
      return;
    }

    const prisma = getPrismaClient();

    const application = await prisma.application.update({
      where: { id: parseInt(id, 10) }, // Convert id to number
      data: { paid: true }, // Corrected property name
    });

    res.status(200).json({ message: 'Payment status updated', application });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check user payment status
export const checkUserPaymentStatus = async (req: Request, res: Response) => {
  const { phone } = req.params;
  const prisma = getPrismaClient();

  try {
    const applications = await prisma.application.findMany({
      where: { phone },
      select: { paid: true },
    });

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this user' });
    }

    const isPaid = applications.every(app => app.paid);
    res.status(200).json({ isPaid });
  } catch (error) {
    res.status(500).json({ message: 'Error checking payment status', error });
  }
};



