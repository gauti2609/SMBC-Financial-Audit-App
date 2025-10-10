import { z } from "zod";
import { baseProcedure } from "../main";
import { TRPCError } from "@trpc/server";
import { PrismaClient } from "@prisma/client";

const databaseConfigSchema = z.object({
  host: z.string().min(1, "Host is required"),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().min(1, "Database name is required"),
});

const testCustomDatabaseConnection = async (config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): Promise<{ success: boolean; error?: string }> => {
  const connectionUrl = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
  
  let testClient: PrismaClient | null = null;
  
  try {
    // Create a temporary Prisma client with the new connection URL
    testClient = new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
    });
    
    // Test basic connectivity
    await testClient.$queryRaw`SELECT 1`;
    
    // Test that we can perform basic operations (check if tables exist)
    try {
      await testClient.majorHead.count();
    } catch (tableError) {
      // Tables might not exist yet, but connection is working
      console.warn("Database connected but tables may not exist:", tableError);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Database connection test failed:", error);
    
    let errorMessage = "Database connection failed";
    if (error.code === 'ENOTFOUND') {
      errorMessage = `Could not resolve host: ${config.host}`;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = `Connection refused to ${config.host}:${config.port}`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = `Connection timeout to ${config.host}:${config.port}`;
    } else if (error.message?.includes('password authentication failed')) {
      errorMessage = "Invalid username or password";
    } else if (error.message?.includes('database') && error.message?.includes('does not exist')) {
      errorMessage = `Database "${config.database}" does not exist`;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  } finally {
    if (testClient) {
      await testClient.$disconnect();
    }
  }
};

export const testDatabaseConnectionWithConfig = baseProcedure
  .input(databaseConfigSchema)
  .mutation(async ({ input }) => {
    const result = await testCustomDatabaseConnection(input);
    
    if (!result.success) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: result.error || "Database connection failed",
      });
    }
    
    return { success: true, message: "Database connection successful" };
  });

export const getDatabaseConnectionStatus = baseProcedure
  .query(async () => {
    try {
      // Import the existing db connection
      const { verifyDatabaseConnection } = await import("../../db");
      const isConnected = await verifyDatabaseConnection();
      
      return {
        isConnected,
        message: isConnected ? "Database is connected" : "Database connection failed",
      };
    } catch (error: any) {
      return {
        isConnected: false,
        message: error.message || "Database connection check failed",
      };
    }
  });
