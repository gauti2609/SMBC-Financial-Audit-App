// This file ensures the Prisma client is properly generated and exported
// It serves as a centralized configuration point for Prisma client settings

export { PrismaClient } from '@prisma/client';
export type { Prisma } from '@prisma/client';

// Re-export common Prisma types for convenience
export type {
  User,
  Company,
  TrialBalanceEntry,
  ShareCapitalEntry,
  PPEScheduleEntry,
  // Add other model types as needed
} from '@prisma/client';
