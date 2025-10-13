import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getGroupings = baseProcedure.query(async () => {
  return await db.grouping.findMany({
    orderBy: { name: 'asc' },
    include: {
      minorHead: {
        include: {
          majorHead: true // Include full hierarchy: Grouping >> MinorHead >> MajorHead
        }
      },
      _count: {
        select: {
          trialBalanceEntries: true
        }
      }
    }
  });
});
