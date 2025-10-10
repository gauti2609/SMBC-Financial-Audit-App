import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

const employeeBenefitEntrySchema = z.object({
  particulars: z.string().min(1, 'Particulars is required'),
  currentYear: z.number().default(0),
  previousYear: z.number().default(0),
  category: z.enum(['Defined Contribution', 'Defined Benefit']),
});

export const addEmployeeBenefitEntry = baseProcedure
  .input(employeeBenefitEntrySchema)
  .mutation(async ({ input }) => {
    return await db.employeeBenefitEntry.create({
      data: input,
    });
  });
