import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const deferredTaxEntrySchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  bookValue: z.number().default(0),
  taxValue: z.number().default(0),
  temporaryDifference: z.number().default(0),
  taxRate: z.number().default(0),
  deferredTaxAsset: z.number().default(0),
  deferredTaxLiability: z.number().default(0),
  category: z.enum(['Asset', 'Liability', 'Income', 'Expense']),
});

export const addDeferredTaxEntry = baseProcedure
  .input(deferredTaxEntrySchema)
  .mutation(async ({ input }) => {
    return await db.deferredTaxEntry.create({
      data: input,
    });
  });
