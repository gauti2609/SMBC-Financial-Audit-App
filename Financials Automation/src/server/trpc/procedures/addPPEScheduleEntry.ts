import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const ppeScheduleEntrySchema = z.object({
  companyId: z.string(),
  assetClass: z.string().min(1, 'Asset class is required'),
  openingGrossBlock: z.number().default(0),
  additions: z.number().default(0),
  disposalsGross: z.number().default(0),
  openingAccDepreciation: z.number().default(0),
  depreciationForYear: z.number().default(0),
  accDeprOnDisposals: z.number().default(0),
});

export const addPPEScheduleEntry = baseProcedure
  .input(ppeScheduleEntrySchema)
  .mutation(async ({ input }) => {
    return await db.pPEScheduleEntry.create({
      data: input,
    });
  });
