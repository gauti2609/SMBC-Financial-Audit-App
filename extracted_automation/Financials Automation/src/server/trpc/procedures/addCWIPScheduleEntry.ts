import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const cwipScheduleEntrySchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  amountCY: z.number().default(0),
  amountPY: z.number().default(0),
  agingBucket: z.string().optional(),
});

export const addCWIPScheduleEntry = baseProcedure
  .input(cwipScheduleEntrySchema)
  .mutation(async ({ input }) => {
    return await db.cWIPScheduleEntry.create({
      data: input,
    });
  });
