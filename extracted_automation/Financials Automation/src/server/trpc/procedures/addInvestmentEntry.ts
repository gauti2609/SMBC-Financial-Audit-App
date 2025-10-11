import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const investmentEntrySchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  classification: z.enum(['Current', 'Non-Current']),
  costCY: z.number().default(0),
  costPY: z.number().default(0),
});

export const addInvestmentEntry = baseProcedure
  .input(investmentEntrySchema)
  .mutation(async ({ input }) => {
    return await db.investmentEntry.create({
      data: input,
    });
  });
