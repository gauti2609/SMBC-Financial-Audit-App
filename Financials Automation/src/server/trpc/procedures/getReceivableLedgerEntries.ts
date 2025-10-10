import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getReceivableLedgerEntries = baseProcedure.query(async () => {
  return await db.receivableLedgerEntry.findMany({
    orderBy: { customerName: 'asc' },
  });
});
