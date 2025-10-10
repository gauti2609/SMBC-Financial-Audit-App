import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getIntangibleScheduleEntries = baseProcedure.query(async () => {
  return await db.intangibleScheduleEntry.findMany({
    orderBy: { assetClass: 'asc' },
  });
});
