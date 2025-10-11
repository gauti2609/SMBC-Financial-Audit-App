import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getShareCapitalEntries = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }) => {
    return await db.shareCapitalEntry.findMany({
      where: { companyId: input.companyId },
      orderBy: { classOfShare: 'asc' },
    });
  });
