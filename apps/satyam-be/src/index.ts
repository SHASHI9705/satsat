import dotenv from "dotenv";
dotenv.config();  

import app from './app.js';
import { getPrismaClient } from "./prismaClient.js";

const PORT = process.env.PORT || 3001;

const startServer = async (): Promise<void> => {
  try {
    const prisma = getPrismaClient();
    // Fail fast if database connection is not available.
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

void startServer();
