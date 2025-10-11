import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getCWIPScheduleEntries = baseProcedure.query(async () => {
  return await db.cWIPScheduleEntry.findMany({
    orderBy: { particulars: 'asc' },
  });
});
