// This file ensures the Prisma client is properly generated and exported
// It serves as a centralized configuration point for Prisma client settings

export { PrismaClient } from '../src/generated/prisma';
export type { Prisma } from '../src/generated/prisma';

// Re-export common Prisma types for convenience
export type {
  User,
  Company,
  TrialBalanceEntry,
  ShareCapitalEntry,
  PPEScheduleEntry,
  // Add other model types as needed
} from '../src/generated/prisma';
