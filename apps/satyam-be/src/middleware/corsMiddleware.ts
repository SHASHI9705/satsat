import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies and credentials
});

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Extract the token

  if (!token) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.user = { id: token }; // Populate req.user with the token (user ID)
  next();
};

export default authMiddleware;