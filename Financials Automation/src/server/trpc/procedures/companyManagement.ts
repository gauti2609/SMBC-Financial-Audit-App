import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../main";
import { db } from "../../db";

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(100, "Company name too long"),
  displayName: z.string().min(1, "Display name is required").max(100, "Display name too long"),
  description: z.string().optional(),
});

const updateCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Company name is required").max(100, "Company name too long").optional(),
  displayName: z.string().min(1, "Display name is required").max(100, "Display name too long").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const companyIdSchema = z.object({
  companyId: z.string(),
});

export const getCompanies = baseProcedure
  .query(async () => {
    try {
      const companies = await db.company.findMany({
        orderBy: [
          { isActive: 'desc' },
          { name: 'asc' }
        ],
      });
      
      return companies;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch companies: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const getCompany = baseProcedure
  .input(companyIdSchema)
  .query(async ({ input }) => {
    try {
      const company = await db.company.findUnique({
        where: { id: input.companyId },
      });
      
      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company not found'
        });
      }
      
      return company;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch company: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const createCompany = baseProcedure
  .input(createCompanySchema)
  .mutation(async ({ input }) => {
    try {
      // Check if company name already exists
      const existingCompany = await db.company.findUnique({
        where: { name: input.name },
      });
      
      if (existingCompany) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A company with this name already exists'
        });
      }
      
      const company = await db.company.create({
        data: {
          name: input.name,
          displayName: input.displayName,
          description: input.description,
          isActive: true,
        },
      });
      
      return company;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create company: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const updateCompany = baseProcedure
  .input(updateCompanySchema)
  .mutation(async ({ input }) => {
    try {
      const { id, ...updateData } = input;
      
      // Check if company exists
      const existingCompany = await db.company.findUnique({
        where: { id },
      });
      
      if (!existingCompany) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company not found'
        });
      }
      
      // Check if new name conflicts with another company
      if (updateData.name && updateData.name !== existingCompany.name) {
        const nameConflict = await db.company.findUnique({
          where: { name: updateData.name },
        });
        
        if (nameConflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A company with this name already exists'
          });
        }
      }
      
      const updatedCompany = await db.company.update({
        where: { id },
        data: updateData,
      });
      
      return updatedCompany;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to update company: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const deleteCompany = baseProcedure
  .input(companyIdSchema)
  .mutation(async ({ input }) => {
    try {
      // Check if company exists
      const existingCompany = await db.company.findUnique({
        where: { id: input.companyId },
      });
      
      if (!existingCompany) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company not found'
        });
      }
      
      // Check if company has data (optional: prevent deletion if has data)
      const hasData = await Promise.all([
        db.trialBalanceEntry.count({ where: { companyId: input.companyId } }),
        db.commonControl.count({ where: { companyId: input.companyId } }),
        db.shareCapitalEntry.count({ where: { companyId: input.companyId } }),
      ]);
      
      const totalRecords = hasData.reduce((sum, count) => sum + count, 0);
      
      if (totalRecords > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: `Cannot delete company with existing data. Found ${totalRecords} records. Please delete all data first or use archive instead.`
        });
      }
      
      await db.company.delete({
        where: { id: input.companyId },
      });
      
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to delete company: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const archiveCompany = baseProcedure
  .input(companyIdSchema)
  .mutation(async ({ input }) => {
    try {
      const company = await db.company.findUnique({
        where: { id: input.companyId },
      });
      
      if (!company) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Company not found'
        });
      }
      
      const updatedCompany = await db.company.update({
        where: { id: input.companyId },
        data: { isActive: false },
      });
      
      return updatedCompany;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to archive company: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const getCompanyStats = baseProcedure
  .input(companyIdSchema)
  .query(async ({ input }) => {
    try {
      const [
        trialBalanceCount,
        shareCapitalCount,
        ppeCount,
        investmentCount,
        receivableCount,
        payableCount,
        noteSelectionCount,
        commonControlCount,
      ] = await Promise.all([
        db.trialBalanceEntry.count({ where: { companyId: input.companyId } }),
        db.shareCapitalEntry.count({ where: { companyId: input.companyId } }),
        db.ppeScheduleEntry.count({ where: { companyId: input.companyId } }),
        db.investmentEntry.count({ where: { companyId: input.companyId } }),
        db.receivableLedgerEntry.count({ where: { companyId: input.companyId } }),
        db.payableLedgerEntry.count({ where: { companyId: input.companyId } }),
        db.noteSelection.count({ where: { companyId: input.companyId } }),
        db.commonControl.count({ where: { companyId: input.companyId } }),
      ]);
      
      return {
        trialBalanceEntries: trialBalanceCount,
        shareCapitalEntries: shareCapitalCount,
        ppeEntries: ppeCount,
        investmentEntries: investmentCount,
        receivableEntries: receivableCount,
        payableEntries: payableCount,
        noteSelections: noteSelectionCount,
        hasEntityInfo: commonControlCount > 0,
        totalDataPoints: trialBalanceCount + shareCapitalCount + ppeCount + investmentCount + receivableCount + payableCount,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to get company statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
