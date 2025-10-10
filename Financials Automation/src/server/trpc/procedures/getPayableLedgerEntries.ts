import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getPayableLedgerEntries = baseProcedure.query(async () => {
  return await db.payableLedgerEntry.findMany({
    orderBy: { vendorName: 'asc' },
  });
});
