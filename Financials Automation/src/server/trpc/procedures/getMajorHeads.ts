import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getMajorHeads = baseProcedure.query(async () => {
  return await db.majorHead.findMany({
    orderBy: [
      { statementType: 'asc' }, // BS first, then PL
      { category: 'asc' }, // Within each type: Asset/Income before Liability/Expense
      { name: 'asc' }
    ],
    include: {
      _count: {
        select: {
          minorHeads: true,
          trialBalanceEntries: true
        }
      }
    }
  });
});
