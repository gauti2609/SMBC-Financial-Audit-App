import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const deleteTrialBalanceEntry = baseProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }) => {
    return await db.trialBalanceEntry.delete({
      where: { id: input.id },
    });
  });
