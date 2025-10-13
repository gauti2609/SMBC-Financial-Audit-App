import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const taxEntrySchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  currentYear: z.number().default(0),
  previousYear: z.number().default(0),
  taxRate: z.number().optional(),
});

export const addTaxEntry = baseProcedure
  .input(taxEntrySchema)
  .mutation(async ({ input }) => {
    return await db.taxEntry.create({
      data: input,
    });
  });
