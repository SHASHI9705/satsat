import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

// Create a new user manually
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phone, address, token } = req.body;

    try {
        if (token) {
            // Google Signup
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: "YOUR_GOOGLE_CLIENT_ID",
            });

            const payload = ticket.getPayload();

            if (!payload) {
                res.status(400).json({ message: 'Invalid Google token' });
                return;
            }

            const googleName = payload.name || 'Default Name';
            const googleEmail = payload.email || 'default@example.com';
            const googleId = payload.sub;

            let user = await prisma.user.findUnique({
                where: { email: googleEmail },
            });

            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: googleName,
                        email: googleEmail,
                        googleId,
                        phone: '', // Default value for phone
                        address: '', // Default value for address
                        password: 'google-oauth', // Default value for password
                    },
                });
            }

            res.status(200).json({ message: 'Google signup successful', user });
        } else {
            // Manual Signup
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    address,
                },
            });

            res.status(201).json({ message: 'User created successfully', user });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user', error });
    }
};