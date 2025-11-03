import express from 'express';
import userRoutes from './routes/userRoutes';
import corsMiddleware from './middleware/corsMiddleware';
import itemRoutes from './routes/itemRoutes';
import sellerRoutes from './routes/sellerRoutes';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config(); 


const app: express.Express = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/seller', sellerRoutes); // Register seller routes

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Handle Invalid Routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;


