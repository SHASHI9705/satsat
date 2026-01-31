import { Request, Response } from 'express';
import prisma from '../prismaClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// `prisma` may be null when DB isn't configured; controllers should check before DB ops.
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
}

// Create a new user manually
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone, address, googleId, regnumber } = req.body; // Added regnumber

    console.log('Request body:', req.body); // Log the incoming request body
    console.log('Checking if user exists with email:', email); // Log email being checked

    try {
        let user = await prisma.user.findUnique({
            where: { email: email }, // Ensure the `email` field is used correctly
        });

        if (!user) {
            console.log('User not found, creating new user...');
            if (!password && !googleId) {
                res.status(400).json({ message: 'Password or Google ID is required for new users' });
                return;
            }

            const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

            const userData = {
                name,
                email,
                address,
                googleId,
                ...(phone ? { phone } : {}), // Include phone only if provided
                ...(hashedPassword ? { password: hashedPassword } : {}),
                ...(regnumber ? { regnumber } : {}), // Include regnumber only if provided
            };

            user = await prisma.user.create({
                data: userData as any, // Use `as any` to bypass strict type checking temporarily
            });
            console.log('User created successfully:', user);
        }

        const jwtToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'User authenticated successfully', user, token: jwtToken });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Fetch user details
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.query;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: email as string },
            select: {
                name: true,
                email: true,
                phone: true,
                address: true,
                regnumber: true, // Include regnumber in the response
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details', error });
    }
};

// Update user details
export const updateUserDetails = async (req: Request, res: Response): Promise<void> => {
    const { email, name, phone, address, regnumber } = req.body; // Added regnumber

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { name, phone, address, regnumber }, // Include regnumber in the update
        });

        res.status(200).json({ message: 'User details updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Error updating user details', error });
    }
};

// Change user password
export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !newPassword) {
        res.status(400).json({ message: 'Email and newPassword are required' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // If user has a password set, verify oldPassword
        if (user.password) {
            if (!oldPassword) {
                res.status(400).json({ message: 'oldPassword is required' });
                return;
            }

            const match = await bcrypt.compare(oldPassword, user.password);
            if (!match) {
                res.status(401).json({ message: 'Old password is incorrect' });
                return;
            }
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { email }, data: { password: hashed } });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password', error });
    }
};

// Delete user account
export const deleteUserAccount = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        await prisma.user.delete({
            where: { email },
        });

        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ message: 'Error deleting user account', error });
    }
};