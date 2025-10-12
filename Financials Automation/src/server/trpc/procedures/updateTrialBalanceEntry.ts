import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const updateTrialBalanceEntrySchema = z.object({
  id: z.string(),
  ledgerName: z.string().min(1, 'Ledger name is required'),
  openingBalanceCY: z.number().default(0),
  debitCY: z.number().default(0),
  creditCY: z.number().default(0),
  closingBalanceCY: z.number().default(0),
  closingBalancePY: z.number().default(0),
  type: z.enum(["BS", "PL"]),
  majorHead: z.string().optional(),
  minorHead: z.string().optional(),
  grouping: z.string().optional(),
});

export const updateTrialBalanceEntry = baseProcedure
  .input(updateTrialBalanceEntrySchema)
  .mutation(async ({ input }) => {
    const { id, majorHead, minorHead, grouping, ...entryData } = input;
    
    let majorHeadId = null;
    let minorHeadId = null;
    let groupingId = null;

    // Find or create major head
    if (majorHead) {
      const majorHeadRecord = await db.majorHead.upsert({
        where: { name: majorHead },
        create: { name: majorHead },
        update: {},
      });
      majorHeadId = majorHeadRecord.id;
    }

    // Find or create minor head
    if (minorHead) {
      const minorHeadRecord = await db.minorHead.upsert({
        where: { name: minorHead },
        create: { name: minorHead },
        update: {},
      });
      minorHeadId = minorHeadRecord.id;
    }

    // Find or create grouping
    if (grouping) {
      const groupingRecord = await db.grouping.upsert({
        where: { name: grouping },
        create: { name: grouping },
        update: {},
      });
      groupingId = groupingRecord.id;
    }

    return await db.trialBalanceEntry.update({
      where: { id },
      data: {
        ...entryData,
        majorHeadId,
        minorHeadId,
        groupingId,
      },
      include: {
        majorHead: true,
        minorHead: true,
        grouping: true,
      },
    });
  });
