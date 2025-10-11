import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const relatedPartyTransactionSchema = z.object({
  companyId: z.string(),
  relatedPartyName: z.string().min(1, 'Related party name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  transactionType: z.string().min(1, 'Transaction type is required'),
  amountCY: z.number().default(0),
  amountPY: z.number().default(0),
  balanceOutstandingCY: z.number().default(0),
  balanceOutstandingPY: z.number().default(0),
});

export const addRelatedPartyTransaction = baseProcedure
  .input(relatedPartyTransactionSchema)
  .mutation(async ({ input }) => {
    return await db.relatedPartyTransaction.create({
      data: input,
    });
  });
