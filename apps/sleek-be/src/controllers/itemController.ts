import { Request, Response,RequestHandler } from 'express';
import prisma from '../prismaClient';
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

// `prisma` is imported from `src/prismaClient.ts` and may be `null` if initialization failed.

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

// Load JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in the environment variables.');
} 

// Update the createItem function to upload files directly to S3
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, category, actualPrice, discountedPrice, userId, description, tags, type } = req.body;

        // Validate required fields
        const finalCategory = type === 'service' ? 'Tutoring & Services' : category;

        if (!name || !finalCategory || !actualPrice || !userId) {
            res.status(400).json({
                message: 'Invalid input. Ensure all required fields are provided.',
                missingFields: {
                    name: !name ? 'Name is required' : undefined,
                    category: !finalCategory ? 'Category is required' : undefined,
                    actualPrice: !actualPrice ? 'Actual price is required' : undefined,
                    userId: !userId ? 'User ID is required' : undefined,
                },
            });
            return;
        }

        // Upload files to S3 (images are optional for services)
        let imageUrls: string[] = [];
        if (req.files && (req.files as Express.Multer.File[]).length > 0) {
            imageUrls = await Promise.all(
                (req.files as Express.Multer.File[]).map(async (file) => {
                    const result = await uploadToS3(file); // Pass the file object directly
                    return result; // S3 file URL
                })
            );
        }

        const parsedTags = (() => {
            if (!tags) return [] as string[];
            if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
            if (typeof tags === 'string') {
                try {
                    const parsed = JSON.parse(tags);
                    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
                } catch {
                    return tags.split(',').map((t) => t.trim()).filter(Boolean);
                }
            }
            return [] as string[];
        })();

        // Create new item
        const newItem = await prisma.item.create({
            data: {
                name,
                images: imageUrls,
                category: finalCategory,
                actualPrice: parseFloat(actualPrice),
                discountedPrice: parseFloat(discountedPrice),
                userId: parseInt(userId, 10),
                description, // Add description field
                tags: parsedTags,
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
export const updateItemSoldStatus: RequestHandler = async (req, res) => {
  const { id, sold } = req.body;

  if (typeof id !== "number" || typeof sold !== "boolean") {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    // Update the sold status of the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: { sold },
    });

    res.status(200).json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("Error updating item sold status:", error);
    res.status(500).json({ message: "Failed to update item sold status" });
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

        if (!prisma) {
            // DB not available — return empty list so frontend can render.
            res.status(200).json({ items: [] });
            return;
        }

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
                sold: true || false,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        name: true,
                        regnumber: true, // Include regnumber in the response
                    },
                },
            },
        });
        console.debug('Fetched items:', items); // Debugging: Log the fetched items

        res.status(200).json({ items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Error fetching items', error });
    }
};

// Add a dedicated deleteItem function
export const deleteItem: RequestHandler = async (req, res) => {
  const { id } = req.body; // Extract id from the request body

  if (!id) {
    res.status(400).json({ message: "Product ID is required" });
    return;
  }

  try {
    // Fetch the product to get the image key
    const product = await prisma.item.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Delete the product image from S3
    if (product.images && product.images.length > 0) {
      for (const imageKey of product.images) {
        await deleteFromS3(imageKey);
      }
    }

    // Delete the product from the database
    await prisma.item.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
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
    } catch (error: any) {
        // Log the error but return an empty list so the frontend doesn't break
        console.error('Error fetching all items (returning empty list):', error?.message || error);
        res.status(200).json({ items: [] });
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
                        regnumber: true, // Include regnumber in the response
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
                        name: true,
                        regnumber: true, // Include regnumber in related products
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