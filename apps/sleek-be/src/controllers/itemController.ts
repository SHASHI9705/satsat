import { Request, Response,RequestHandler } from 'express';
import { PrismaClient, DashboardMetrics } from '@prisma/client';
import multer from 'multer';
import { uploadToS3, deleteFromS3 } from '../utils/s3Uploader'; // Import deleteFromS3 function
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Express Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      user?: { id: number }; // Add user property with id
    }
  }
}

const prisma = new PrismaClient();

// Configure Multer to use memory storage
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 10,
  },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

// Hardcode JWT_SECRET for debugging purposes
const JWT_SECRET: string = 'shashi9705';

// Debugging: Log the JWT_SECRET value (ensure this is removed in production)
console.debug('JWT_SECRET value:', JWT_SECRET);

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in the environment variables.');
}

// Update the createItem function to upload files directly to S3
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, category, actualPrice, discountedPrice, userId, description } = req.body;

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
                description, // Add description field
                sold: false,
            },
        });

        // Update dashboard metrics
        await prisma.dashboardMetrics.upsert({
            where: { userId: parseInt(userId, 10) }, // Use `userId` as the unique identifier
            update: {
                activeListings: { increment: 1 },
                newListings: { increment: 1 },
            },
            create: {
                userId: parseInt(userId, 10), // Ensure `userId` is used for creation
                activeListings: 1,
                totalEarnings: 0,
                totalSales: 0,
                newListings: 1,
            },
        });

        res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: 'Error creating item', error });
    }
};

// Export the Multer middleware for use in routes
export const uploadMiddleware: RequestHandler  = upload.array('images', 10); // Allow up to 10 files

// Update the 'sold' status of an item
export const updateItemSoldStatus = async (req: Request, res: Response): Promise<void> => {
    const { id, sold } = req.body;
    console.log('Received request to update sold status:', { id, sold }); // Log the incoming request

    if (typeof id !== 'number' || typeof sold !== 'boolean') {
        console.error('Invalid input:', { id, sold }); // Log invalid input
        res.status(400).json({ message: 'Invalid input' });
        return;
    }

    try {
        const item = await prisma.item.findUnique({
            where: { id },
        });
        console.log('Fetched item:', item); // Log the fetched item

        if (!item) {
            console.error('Item not found:', { id }); // Log item not found
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        if (sold) {
            const dashboardMetrics = await prisma.dashboardMetrics.upsert({
                where: { userId: item.userId },
                update: {
                    totalEarnings: { increment: item.discountedPrice },
                    totalSales: { increment: 1 },
                    activeListings: { decrement: 1 },
                },
                create: {
                    userId: item.userId,
                    totalEarnings: item.discountedPrice,
                    totalSales: 1,
                    activeListings: 0,
                    newListings: 0,
                },
            });
            console.log('Updated dashboard metrics:', dashboardMetrics); // Log the updated dashboard metrics
        }

        // Delete images from S3
        if (item.images && Array.isArray(item.images)) {
            for (const imageUrl of item.images) {
                const fileKey = imageUrl.split('/').pop(); // Extract file key from URL
                if (fileKey) {
                    await deleteFromS3(fileKey);
                    console.log(`Deleted image from S3: ${fileKey}`); // Log the deleted image
                }
            }
        }

        // Delete the item from the database
        await prisma.item.delete({
            where: { id },
        });
        console.log('Deleted item from database:', { id }); // Log the deleted item

        res.status(200).json({ message: 'Item marked as sold and deleted successfully' });
    } catch (error) {
        console.error('Error updating item sold status:', error); // Log the error
        res.status(500).json({ message: 'Error updating item sold status', error });
    }
};

// Update fetchItems to directly use email for fetching items
export const fetchItems = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        res.status(400).json({ message: 'Email is required and must be a string' });
        return;
    }

    try {
        console.debug('Fetching items for email:', email); // Debugging: Log the email

        const items = await prisma.item.findMany({
            where: { user: { email } },
            select: {
                id: true,
                name: true,
                images: true,
                category: true,
                actualPrice: true,
                discountedPrice: true,
                description: true,
                sold: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.debug('Fetched items:', items); // Debugging: Log the fetched items

        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error });
    }
};

// Add deleteItem function
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: 'Item ID is required' });
        return;
    }

    try {
        // Find the item to delete
        const item = await prisma.item.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        // Delete images from S3
        if (item.images && Array.isArray(item.images)) {
            for (const imageUrl of item.images) {
                const fileKey = imageUrl.split('/').pop(); // Extract file key from URL
                if (fileKey) {
                    await deleteFromS3(fileKey);
                }
            }
        }

        // Delete the item from the database
        await prisma.item.delete({
            where: { id: parseInt(id, 10) },
        });

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Error deleting item', error });
    }
};

// Add fetchAllItems function
export const fetchAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const items = await prisma.item.findMany({
            include: {
                user: {
                    select: {
                        name: true, // Include only the user's name
                    },
                },
            },
        });
        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching all items:', error);
        res.status(500).json({ message: 'Error fetching all items', error });
    }
};

// Add fetchItemById function
export const fetchItemById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: 'Item ID is required' });
        return;
    }

    try {
        const item = await prisma.item.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        // Fetch related products (example logic, adjust as needed)
        const relatedProducts = await prisma.item.findMany({
            where: { category: item.category, id: { not: item.id } },
            take: 4,
            include: {
                user: {
                    select: {
                        name: true, // Include the user's name
                    },
                },
            },
        });

        res.status(200).json({ item, relatedProducts });
    } catch (error) {
        console.error('Error fetching item by ID:', error);
        res.status(500).json({ message: 'Error fetching item by ID', error });
    }
};

// Add fetchSellerById function
export const fetchSellerById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: 'Seller ID is required' });
        return;
    }

    try {
        const seller = await prisma.user.findUnique({
            where: { id: parseInt(id, 10) },
            select: {
                name: true,
                email: true,
                phone: true,
                address: true,
            },
        });

        if (!seller) {
            res.status(404).json({ message: 'Seller not found' });
            return;
        }

        res.status(200).json({ seller });
    } catch (error) {
        console.error('Error fetching seller details:', error);
        res.status(500).json({ message: 'Error fetching seller details', error });
    }
};