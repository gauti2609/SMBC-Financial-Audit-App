import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getAccountingPolicies = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }) => {
    // First try to get company-specific policies
    const companyPolicies = await db.accountingPolicyContent.findMany({
      where: { companyId: input.companyId },
      orderBy: { noteRef: 'asc' },
    });
    
    // If no company-specific policies exist, return default policies
    if (companyPolicies.length === 0) {
      return await db.accountingPolicyContent.findMany({
        where: { companyId: null },
        orderBy: { noteRef: 'asc' },
      });
    }
    
    return companyPolicies;
  });
