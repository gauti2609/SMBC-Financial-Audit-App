import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const contingentLiabilitySchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  type: z.enum(['Contingent Liability', 'Commitment']),
  amountCY: z.number().default(0),
  amountPY: z.number().default(0),
});

export const addContingentLiability = baseProcedure
  .input(contingentLiabilitySchema)
  .mutation(async ({ input }) => {
    return await db.contingentLiability.create({
      data: input,
    });
  });
