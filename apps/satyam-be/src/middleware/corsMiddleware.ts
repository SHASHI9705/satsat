import cors from 'cors';

const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies and credentials
});

export default corsMiddleware;