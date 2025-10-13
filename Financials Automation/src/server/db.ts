import { PrismaClient } from "../generated/prisma";

import { env } from "./env";

const createPrismaClient = () => {
  try {
    return new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    throw error;
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Verify that the database connection is working properly
 * This helps prevent "Cannot read properties of undefined" errors
 */
export const verifyDatabaseConnection = async (): Promise<boolean> => {
  try {
    if (!db) {
      console.error('Database client is not initialized');
      return false;
    }
    
    // Test basic connectivity
    await db.$queryRaw`SELECT 1`;
    
    // Test that we can perform basic operations
    await db.majorHead.count();
    
    return true;
  } catch (error) {
    console.error('Database connection verification failed:', error);
    return false;
  }
};

/**
 * Ensure database connection is ready, with retry logic
 */
export const ensureDatabaseConnection = async (maxRetries: number = 3): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const isConnected = await verifyDatabaseConnection();
    
    if (isConnected) {
      return;
    }
    
    if (attempt < maxRetries) {
      console.log(`Database connection attempt ${attempt} failed, retrying...`);
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error(`Failed to establish database connection after ${maxRetries} attempts`);
};
