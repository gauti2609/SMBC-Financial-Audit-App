import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getContingentLiabilities = baseProcedure.query(async () => {
  return await db.contingentLiability.findMany({
    orderBy: { particulars: 'asc' },
  });
});
