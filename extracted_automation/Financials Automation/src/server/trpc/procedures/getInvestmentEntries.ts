import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getInvestmentEntries = baseProcedure.query(async () => {
  return await db.investmentEntry.findMany({
    orderBy: { particulars: 'asc' },
  });
});
