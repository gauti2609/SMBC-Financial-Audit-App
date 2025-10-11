import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const intangibleScheduleEntrySchema = z.object({
  assetClass: z.string().min(1, 'Asset class is required'),
  openingGrossBlock: z.number().default(0),
  additions: z.number().default(0),
  disposalsGross: z.number().default(0),
  openingAccAmortization: z.number().default(0),
  amortizationForYear: z.number().default(0),
  accAmortOnDisposals: z.number().default(0),
  agingBucket: z.string().optional(),
});

export const addIntangibleScheduleEntry = baseProcedure
  .input(intangibleScheduleEntrySchema)
  .mutation(async ({ input }) => {
    return await db.intangibleScheduleEntry.create({
      data: input,
    });
  });
