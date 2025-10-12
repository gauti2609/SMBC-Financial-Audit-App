import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getTaxEntries = baseProcedure.query(async () => {
  return await db.taxEntry.findMany({
    orderBy: { particulars: 'asc' },
  });
});
