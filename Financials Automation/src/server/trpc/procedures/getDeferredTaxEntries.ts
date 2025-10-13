import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getDeferredTaxEntries = baseProcedure.query(async () => {
  return await db.deferredTaxEntry.findMany({
    orderBy: { particulars: 'asc' },
  });
});
