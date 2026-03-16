import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient;

try {
  prismaInstance = new PrismaClient();
} catch (error) {
  // Log the initialization error, then provide a typed stub so TypeScript
  // callers don't need to be nullable. Runtime calls will throw if used.
  // eslint-disable-next-line no-console
  console.error('PrismaClient initialization failed:', error);
  prismaInstance = {} as unknown as PrismaClient;
}

export function getPrismaClient(): PrismaClient {
  return prismaInstance;
}