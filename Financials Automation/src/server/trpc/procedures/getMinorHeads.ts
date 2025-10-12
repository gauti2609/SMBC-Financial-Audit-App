import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getMinorHeads = baseProcedure.query(async () => {
  return await db.minorHead.findMany({
    orderBy: { name: 'asc' },
    include: {
      majorHead: true, // Include parent Major Head info
      _count: {
        select: {
          groupings: true,
          trialBalanceEntries: true
        }
      }
    }
  });
});
