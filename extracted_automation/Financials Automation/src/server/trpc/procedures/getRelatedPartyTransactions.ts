import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getRelatedPartyTransactions = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }) => {
    return await db.relatedPartyTransaction.findMany({
      where: { companyId: input.companyId },
      orderBy: { relatedPartyName: 'asc' },
    });
  });
