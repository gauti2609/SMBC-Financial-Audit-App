import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getEmployeeBenefitEntries = baseProcedure.query(async () => {
  return await db.employeeBenefitEntry.findMany({
    orderBy: { particulars: 'asc' },
  });
});
