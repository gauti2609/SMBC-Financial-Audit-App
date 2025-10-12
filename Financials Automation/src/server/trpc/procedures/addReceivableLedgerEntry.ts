import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const receivableLedgerEntrySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  invoiceAmount: z.number().default(0),
  amountSettled: z.number().default(0),
  outstandingAmount: z.number().default(0),
  disputed: z.boolean().default(false),
  daysOutstanding: z.number().optional(),
  agingBucket: z.string().optional(),
});

export const addReceivableLedgerEntry = baseProcedure
  .input(receivableLedgerEntrySchema)
  .mutation(async ({ input }) => {
    return await db.receivableLedgerEntry.create({
      data: input,
    });
  });
