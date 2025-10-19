import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// Create a new user manually
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone, address, googleId } = req.body;

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