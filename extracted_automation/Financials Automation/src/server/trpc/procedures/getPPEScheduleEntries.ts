import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getPPEScheduleEntries = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }) => {
    return await db.pPEScheduleEntry.findMany({
      where: { companyId: input.companyId },
      orderBy: { assetClass: 'asc' },
    });
  });
