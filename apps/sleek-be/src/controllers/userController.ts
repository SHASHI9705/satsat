import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import  { bcrypt } from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

// Create a new user manually
export const createUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Google Signup
export const googleSignup = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        // Verify the Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: "YOUR_GOOGLE_CLIENT_ID",
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const { name, email, sub: googleId } = payload;

        // Check if the user already exists
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Create the user if they don't exist
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    googleId,
                },
            });
        }

        res.status(200).json({ message: 'Google signup successful', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during Google signup', error });
    }
};