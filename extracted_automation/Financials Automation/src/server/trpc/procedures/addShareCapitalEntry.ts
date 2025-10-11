import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const shareCapitalEntrySchema = z.object({
  companyId: z.string(),
  classOfShare: z.string().default("Equity Shares"),
  numberOfShares: z.bigint().default(BigInt(0)),
  faceValue: z.number().default(10),
  amountCY: z.number().default(0),
  amountPY: z.number().default(0),
  shareholderName: z.string().optional(),
  holdingPercentageCY: z.number().optional(),
  numberOfSharesPY: z.bigint().optional(),
});

export const addShareCapitalEntry = baseProcedure
  .input(shareCapitalEntrySchema)
  .mutation(async ({ input }) => {
    return await db.shareCapitalEntry.create({
      data: input,
    });
  });
