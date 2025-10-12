import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getMinorHeads = baseProcedure.query(async () => {
  return await db.minorHead.findMany({
    orderBy: { name: 'asc' },
  });
});
