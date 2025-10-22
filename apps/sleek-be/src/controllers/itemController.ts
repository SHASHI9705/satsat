import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { uploadToS3 } from '../utils/s3Uploader';

// Extend Express Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
    }
  }
}

const prisma = new PrismaClient();

// Configure Multer to use memory storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Update the createItem function to upload files directly to S3
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, category, actualPrice, discountedPrice, userId } = req.body;

        // Validate required fields
        if (!name || !category || !actualPrice || !userId) {
            res.status(400).json({
                message: 'Invalid input. Ensure all required fields are provided.',
                missingFields: {
                    name: !name ? 'Name is required' : undefined,
                    category: !category ? 'Category is required' : undefined,
                    actualPrice: !actualPrice ? 'Actual price is required' : undefined,
                    userId: !userId ? 'User ID is required' : undefined,
                },
            });
            return;
        }

        // Validate uploaded files
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            res.status(400).json({
                message: 'No files uploaded. Please upload at least one image.',
            });
            return;
        }

        // Upload files to S3
        const imageUrls = await Promise.all(
            (req.files as Express.Multer.File[]).map(async (file) => {
                const result = await uploadToS3(file); // Pass the file object directly
                return result; // S3 file URL
            })
        );

        // Create new item
        const newItem = await prisma.item.create({
            data: {
                name,
                images: imageUrls,
                category,
                actualPrice: parseFloat(actualPrice),
                discountedPrice: parseFloat(discountedPrice),
                userId: parseInt(userId, 10),
                sold: false,
            },
        });

        res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: 'Error creating item', error });
    }
};

// Export the Multer middleware for use in routes
export const uploadMiddleware = upload.array('images', 10); // Allow up to 10 files

// Update the 'sold' status of an item
export const updateItemSoldStatus = async (req: Request, res: Response): Promise<void> => {
    const { id, sold } = req.body;

    if (typeof id !== 'number' || typeof sold !== 'boolean') {
        res.status(400).json({ message: 'Invalid input' });
        return;
    }

    try {
        const updatedItem = await prisma.item.update({
            where: { id },
            data: { sold },
        });

        res.status(200).json({ message: 'Item sold status updated successfully', item: updatedItem });
    } catch (error) {
        console.error('Error updating item sold status:', error);
        res.status(500).json({ message: 'Error updating item sold status', error });
    }
};

// Fetch all items
export const fetchItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await prisma.item.findMany();
        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error });
    }
};