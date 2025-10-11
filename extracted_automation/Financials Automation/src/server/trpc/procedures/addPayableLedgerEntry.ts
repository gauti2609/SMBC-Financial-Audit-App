import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const payableLedgerEntrySchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.date().optional(),
  invoiceAmount: z.number().default(0),
  amountSettled: z.number().default(0),
  outstandingAmount: z.number().default(0),
  disputed: z.boolean().default(false),
  payableType: z.enum(['MSME', 'Other']),
  agingBucket: z.string().optional(),
});

export const addPayableLedgerEntry = baseProcedure
  .input(payableLedgerEntrySchema)
  .mutation(async ({ input }) => {
    return await db.payableLedgerEntry.create({
      data: input,
    });
  });
