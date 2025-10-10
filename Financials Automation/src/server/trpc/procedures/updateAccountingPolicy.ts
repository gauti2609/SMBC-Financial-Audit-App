import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const updateAccountingPolicySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export const updateAccountingPolicy = baseProcedure
  .input(updateAccountingPolicySchema)
  .mutation(async ({ input }) => {
    const { id, ...data } = input;
    return await db.accountingPolicyContent.update({
      where: { id },
      data: {
        ...data,
        isDefault: false, // Mark as modified
      },
    });
  });
