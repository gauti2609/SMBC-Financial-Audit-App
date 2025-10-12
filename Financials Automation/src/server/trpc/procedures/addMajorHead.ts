import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const addMajorHead = baseProcedure
  .input(z.object({ 
    name: z.string().min(1, "Major Head name is required"),
    statementType: z.enum(["BS", "PL"], {
      errorMap: () => ({ message: "Statement type must be 'BS' (Balance Sheet) or 'PL' (Profit & Loss)" })
    }),
    category: z.string().min(1, "Category is required").refine((val) => {
      // Validate category based on statement type
      return ["Asset", "Liability", "Income", "Expense"].includes(val);
    }, {
      message: "For BS: 'Asset' or 'Liability', For PL: 'Income' or 'Expense'"
    })
  }))
  .mutation(async ({ input }) => {
    // Additional validation: check if category matches statement type
    if (input.statementType === "BS" && !["Asset", "Liability"].includes(input.category)) {
      throw new Error("For Balance Sheet (BS), category must be 'Asset' or 'Liability'");
    }
    if (input.statementType === "PL" && !["Income", "Expense"].includes(input.category)) {
      throw new Error("For Profit & Loss (PL), category must be 'Income' or 'Expense'");
    }

    return await db.majorHead.create({
      data: { 
        name: input.name,
        statementType: input.statementType,
        category: input.category
      },
    });
  });
