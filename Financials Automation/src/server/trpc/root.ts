import {
  createCallerFactory,
  createTRPCRouter,
  baseProcedure,
} from "./main";
import { z } from "zod";
import { db } from "../db";
import jwt from "jsonwebtoken";
import { env } from "../env";
import { TRPCError } from "@trpc/server";

// Import authentication procedures
import { register, login, logout, getCurrentUser } from "./procedures/auth";

// Import license procedures
import { validateLicense, getLicenseInfo, updateLicenseUsage } from "./procedures/license";

// Import database connection procedures
import {
  testDatabaseConnectionWithConfig,
  getDatabaseConnectionStatus,
} from "./procedures/databaseConnection";

// Import company management procedures
import {
  getCompany,
  updateCompany,
  deleteCompany,
  archiveCompany,
  getCompanyStats,
} from "./procedures/companyManagement";

// Import new procedures
import { getCommonControl } from "./procedures/getCommonControl";
import { getMajorHeads } from "./procedures/getMajorHeads";
import { getMinorHeads } from "./procedures/getMinorHeads";
import { getGroupings } from "./procedures/getGroupings";
import { addMajorHead } from "./procedures/addMajorHead";
import { addMinorHead } from "./procedures/addMinorHead";
import { addGrouping } from "./procedures/addGrouping";
import { getRelatedPartyTransactions } from "./procedures/getRelatedPartyTransactions";
import { addRelatedPartyTransaction } from "./procedures/addRelatedPartyTransaction";
import { generateCashFlow } from "./procedures/generateCashFlow";
import { generateRatioAnalysis } from "./procedures/generateRatioAnalysis";
import { updateNoteNumbers } from "./procedures/updateNoteNumbers";
import { getTrialBalanceUploadUrl, processTrialBalanceFile } from "./procedures/uploadTrialBalanceFromFile";
import { updateTrialBalanceEntry } from "./procedures/updateTrialBalanceEntry";
import { deleteTrialBalanceEntry } from "./procedures/deleteTrialBalanceEntry";
import { 
  getDebtorsUploadUrl, 
  getCreditorsUploadUrl, 
  processDebtorsFile, 
  processCreditorsFile 
} from "./procedures/uploadDebtorsCreditorsList";
import { getInvestmentUploadUrl, processInvestmentFile } from "./procedures/uploadInvestmentFile";
import { getPPEUploadUrl, processPPEFile } from "./procedures/uploadPPEFile";
import { calculateTaxExpense } from "./procedures/calculateTaxExpense";
import { initializeAccountingPolicies } from "./procedures/initializeAccountingPolicies";
import { 
  getShareCapitalUploadUrl, 
  processShareCapitalFile 
} from "./procedures/uploadShareCapitalFile";
import { 
  getEmployeeBenefitsUploadUrl, 
  processEmployeeBenefitsFile 
} from "./procedures/uploadEmployeeBenefitsFile";
import { 
  getContingentLiabilitiesUploadUrl, 
  processContingentLiabilitiesFile 
} from "./procedures/uploadContingentLiabilitiesFile";
import { 
  getRelatedPartiesUploadUrl, 
  processRelatedPartiesFile 
} from "./procedures/uploadRelatedPartiesFile";

// Import detailed schedule procedures
import { getShareCapitalEntries } from "./procedures/getShareCapitalEntries";
import { addShareCapitalEntry } from "./procedures/addShareCapitalEntry";
import { getPPEScheduleEntries } from "./procedures/getPPEScheduleEntries";
import { addPPEScheduleEntry } from "./procedures/addPPEScheduleEntry";
import { getCWIPScheduleEntries } from "./procedures/getCWIPScheduleEntries";
import { addCWIPScheduleEntry } from "./procedures/addCWIPScheduleEntry";
import { getIntangibleScheduleEntries } from "./procedures/getIntangibleScheduleEntries";
import { addIntangibleScheduleEntry } from "./procedures/addIntangibleScheduleEntry";
import { getInvestmentEntries } from "./procedures/getInvestmentEntries";
import { addInvestmentEntry } from "./procedures/addInvestmentEntry";
import { getEmployeeBenefitEntries } from "./procedures/getEmployeeBenefitEntries";
import { addEmployeeBenefitEntry } from "./procedures/addEmployeeBenefitEntry";
import { getTaxEntries } from "./procedures/getTaxEntries";
import { addTaxEntry } from "./procedures/addTaxEntry";
import { getDeferredTaxEntries } from "./procedures/getDeferredTaxEntries";
import { addDeferredTaxEntry } from "./procedures/addDeferredTaxEntry";
import { updateDeferredTaxEntry } from "./procedures/updateDeferredTaxEntry";
import { deleteDeferredTaxEntry } from "./procedures/deleteDeferredTaxEntry";
import { getAccountingPolicies } from "./procedures/getAccountingPolicies";
import { updateAccountingPolicy } from "./procedures/updateAccountingPolicy";
import { getContingentLiabilities } from "./procedures/getContingentLiabilities";
import { addContingentLiability } from "./procedures/addContingentLiability";
import { getReceivableLedgerEntries } from "./procedures/getReceivableLedgerEntries";
import { addReceivableLedgerEntry } from "./procedures/addReceivableLedgerEntry";
import { getPayableLedgerEntries } from "./procedures/getPayableLedgerEntries";
import { addPayableLedgerEntry } from "./procedures/addPayableLedgerEntry";
import { addNoteSelection } from "./procedures/addNoteSelection";
import { updateNoteSelection } from "./procedures/updateNoteSelection";
import { deleteNoteSelection } from "./procedures/deleteNoteSelection";

// Import export procedures
import {
  exportBalanceSheet,
  exportProfitAndLoss,
  exportCashFlow,
  exportAgingSchedules,
  exportRatioAnalysis,
} from "./procedures/exportFinancialStatements";

// Import compliance validation procedures
import {
  validateScheduleIIICompliance,
  validateNoteCompliance,
  validateFinancialStatementFormat,
} from "./procedures/validateScheduleIIICompliance";
import { debugCompliance } from "./procedures/debugCompliance";

// Input validation schemas
const trialBalanceEntrySchema = z.object({
  ledgerName: z.string(),
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

const commonControlSchema = z.object({
  entityName: z.string().optional(),
  address: z.string().optional(),
  cinNumber: z.string().optional(),
  financialYearStart: z.date().optional(),
  financialYearEnd: z.date().optional(),
  currency: z.string().default("INR"),
  units: z.string().default("Millions"),
  numbersFormat: z.string().default("Accounting"),
  negativeColor: z.string().default("Brackets"),
  defaultFont: z.string().default("Bookman Old Style"),
  defaultFontSize: z.number().default(11),
});

const noteSelectionSchema = z.object({
  noteRef: z.string(),
  userSelected: z.boolean(),
});

export const appRouter = createTRPCRouter({
  // Authentication
  register,
  login,
  logout,
  getCurrentUser,
  
  // License Management
  validateLicense,
  getLicenseInfo,
  updateLicenseUsage,

  // Database Connection Management
  testDatabaseConnection: testDatabaseConnectionWithConfig,
  getDatabaseConnectionStatus,

  // Company Management - now requires authentication
  getCompanies: baseProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ input }) => {
      const { token } = input;
      
      // Verify user authentication
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        
        const session = await db.session.findUnique({
          where: { token },
          include: { user: true },
        });
        
        if (!session || session.expiresAt < new Date() || !session.user.isActive) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired session",
          });
        }
        
        // Return only companies owned by this user
        return await db.company.findMany({
          where: { 
            userId: session.user.id,
            isActive: true 
          },
          orderBy: { name: 'asc' },
        });
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }
    }),

  getCompany,

  createCompany: baseProcedure
    .input(z.object({
      token: z.string(),
      name: z.string(),
      displayName: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { token, name, displayName, description } = input;
      
      // Verify user authentication
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
        
        const session = await db.session.findUnique({
          where: { token },
          include: { user: true },
        });
        
        if (!session || session.expiresAt < new Date() || !session.user.isActive) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired session",
          });
        }
        
        // Create company linked to authenticated user
        return await db.company.create({
          data: {
            name,
            displayName,
            description,
            userId: session.user.id,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
        });
      }
    }),

  updateCompany,
  deleteCompany,
  archiveCompany,
  getCompanyStats,

  // Common Control Data - now requires companyId
  getCommonControl,

  updateCommonControl: baseProcedure
    .input(commonControlSchema.extend({
      companyId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { companyId, ...data } = input;
      
      // Delete existing for this company and create new (simple approach for now)
      await db.commonControl.deleteMany({
        where: { companyId },
      });
      
      return await db.commonControl.create({
        data: {
          ...data,
          companyId,
          financialYearStart: data.financialYearStart ? new Date(data.financialYearStart) : undefined,
          financialYearEnd: data.financialYearEnd ? new Date(data.financialYearEnd) : undefined,
        },
      });
    }),

  // Master Lists with Hierarchical Structure
  getMajorHeads,
  getMinorHeads,
  getGroupings,

  addMajorHead,
  addMinorHead,
  addGrouping,

  updateMajorHead: baseProcedure
    .input(z.object({ 
      id: z.string(), 
      name: z.string(),
      statementType: z.enum(["BS", "PL"]).optional(),
      category: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.majorHead.update({
        where: { id },
        data,
      });
    }),

  deleteMajorHead: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Note: This will cascade delete related Minor Heads and Groupings
      return await db.majorHead.delete({
        where: { id: input.id },
      });
    }),

  updateMinorHead: baseProcedure
    .input(z.object({ 
      id: z.string(), 
      name: z.string(),
      majorHeadId: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.minorHead.update({
        where: { id },
        data,
      });
    }),

  deleteMinorHead: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Note: This will cascade delete related Groupings
      return await db.minorHead.delete({
        where: { id: input.id },
      });
    }),

  updateGrouping: baseProcedure
    .input(z.object({ 
      id: z.string(), 
      name: z.string(),
      minorHeadId: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db.grouping.update({
        where: { id },
        data,
      });
    }),

  deleteGrouping: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.grouping.delete({
        where: { id: input.id },
      });
    }),

  // Related Party Transactions
  getRelatedPartyTransactions,
  addRelatedPartyTransaction,

  // Detailed Schedule Management
  // Share Capital
  getShareCapitalEntries,
  addShareCapitalEntry,

  // PPE Schedule
  getPPEScheduleEntries,
  addPPEScheduleEntry,

  // CWIP Schedule
  getCWIPScheduleEntries,
  addCWIPScheduleEntry,

  // Intangible Assets Schedule
  getIntangibleScheduleEntries,
  addIntangibleScheduleEntry,

  // Investments Schedule
  getInvestmentEntries,
  addInvestmentEntry,

  // Employee Benefits Schedule
  getEmployeeBenefitEntries,
  addEmployeeBenefitEntry,

  // Tax Schedule
  getTaxEntries,
  addTaxEntry,

  // Deferred Tax Schedule
  getDeferredTaxEntries,
  addDeferredTaxEntry,
  updateDeferredTaxEntry,
  deleteDeferredTaxEntry,

  // Accounting Policies
  getAccountingPolicies,
  updateAccountingPolicy,

  // Contingent Liabilities
  getContingentLiabilities,
  addContingentLiability,

  // Receivables Ledger
  getReceivableLedgerEntries,
  addReceivableLedgerEntry,

  // Payables Ledger
  getPayableLedgerEntries,
  addPayableLedgerEntry,

  // Trial Balance Management
  getTrialBalance: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.trialBalanceEntry.findMany({
        where: { companyId: input.companyId },
        include: {
          majorHead: true,
          minorHead: true,
          grouping: true,
        },
        orderBy: { ledgerName: 'asc' },
      });
    }),

  uploadTrialBalance: baseProcedure
    .input(z.object({
      companyId: z.string(),
      entries: z.array(trialBalanceEntrySchema),
    }))
    .mutation(async ({ input }) => {
      const { companyId, entries } = input;
      
      // Clear existing trial balance for this company
      await db.trialBalanceEntry.deleteMany({
        where: { companyId },
      });

      // Process each entry and create with proper relations
      const results = [];
      for (const entry of entries) {
        let majorHeadId = null;
        let minorHeadId = null;
        let groupingId = null;

        // Find or create major head
        if (entry.majorHead) {
          const majorHead = await db.majorHead.upsert({
            where: { name: entry.majorHead },
            create: { name: entry.majorHead },
            update: {},
          });
          majorHeadId = majorHead.id;
        }

        // Find or create minor head
        if (entry.minorHead) {
          const minorHead = await db.minorHead.upsert({
            where: { name: entry.minorHead },
            create: { name: entry.minorHead },
            update: {},
          });
          minorHeadId = minorHead.id;
        }

        // Find or create grouping
        if (entry.grouping) {
          const grouping = await db.grouping.upsert({
            where: { name: entry.grouping },
            create: { name: entry.grouping },
            update: {},
          });
          groupingId = grouping.id;
        }

        const result = await db.trialBalanceEntry.create({
          data: {
            companyId,
            ledgerName: entry.ledgerName,
            openingBalanceCY: entry.openingBalanceCY,
            debitCY: entry.debitCY,
            creditCY: entry.creditCY,
            closingBalanceCY: entry.closingBalanceCY,
            closingBalancePY: entry.closingBalancePY,
            type: entry.type,
            majorHeadId,
            minorHeadId,
            groupingId,
          },
        });
        results.push(result);
      }

      return results;
    }),

  updateTrialBalanceEntry,
  deleteTrialBalanceEntry,

  // File upload procedures
  getTrialBalanceUploadUrl,
  processTrialBalanceFile,

  // Investment file upload
  getInvestmentUploadUrl,
  processInvestmentFile,

  // PPE file upload
  getPPEUploadUrl,
  processPPEFile,

  // Debtors/Creditors file upload procedures
  getDebtorsUploadUrl,
  getCreditorsUploadUrl,
  processDebtorsFile,
  processCreditorsFile,

  // Share Capital file upload
  getShareCapitalUploadUrl,
  processShareCapitalFile,

  // Employee Benefits file upload
  getEmployeeBenefitsUploadUrl,
  processEmployeeBenefitsFile,

  // Contingent Liabilities file upload
  getContingentLiabilitiesUploadUrl,
  processContingentLiabilitiesFile,

  // Related Parties file upload
  getRelatedPartiesUploadUrl,
  processRelatedPartiesFile,

  // Tax calculations
  calculateTaxExpense,

  // Initialize accounting policies
  initializeAccountingPolicies,

  // Aging schedules and reconciliation
  getAgingSchedules: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .query(async ({ input }) => {
      const receivables = await db.receivableLedgerEntry.findMany({
        where: { companyId: input.companyId },
        orderBy: [{ agingBucket: 'asc' }, { customerName: 'asc' }],
      });
      
      const payables = await db.payableLedgerEntry.findMany({
        where: { companyId: input.companyId },
        orderBy: [{ agingBucket: 'asc' }, { vendorName: 'asc' }],
      });

      // Calculate aging summaries
      const receivablesAging = receivables.reduce((acc, entry) => {
        if (!acc[entry.agingBucket]) {
          acc[entry.agingBucket] = { disputed: 0, undisputed: 0, total: 0, count: 0 };
        }
        const amount = Number(entry.outstandingAmount);
        acc[entry.agingBucket].total += amount;
        acc[entry.agingBucket].count += 1;
        if (entry.disputed) {
          acc[entry.agingBucket].disputed += amount;
        } else {
          acc[entry.agingBucket].undisputed += amount;
        }
        return acc;
      }, {} as Record<string, { disputed: number; undisputed: number; total: number; count: number }>);

      const payablesAging = payables.reduce((acc, entry) => {
        if (!acc[entry.agingBucket]) {
          acc[entry.agingBucket] = { msme: 0, others: 0, disputed: 0, undisputed: 0, total: 0, count: 0 };
        }
        const amount = Number(entry.outstandingAmount);
        acc[entry.agingBucket].total += amount;
        acc[entry.agingBucket].count += 1;
        
        if (entry.payableType === 'MSME') {
          acc[entry.agingBucket].msme += amount;
        } else {
          acc[entry.agingBucket].others += amount;
        }
        
        if (entry.disputed) {
          acc[entry.agingBucket].disputed += amount;
        } else {
          acc[entry.agingBucket].undisputed += amount;
        }
        return acc;
      }, {} as Record<string, { msme: number; others: number; disputed: number; undisputed: number; total: number; count: number }>);

      return {
        receivables: {
          entries: receivables,
          aging: receivablesAging,
          totalOutstanding: receivables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0),
          advanceFromCustomers: receivables
            .filter(entry => Number(entry.outstandingAmount) < 0)
            .reduce((sum, entry) => sum + Math.abs(Number(entry.outstandingAmount)), 0),
          tradeReceivables: receivables
            .filter(entry => Number(entry.outstandingAmount) > 0)
            .reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0),
        },
        payables: {
          entries: payables,
          aging: payablesAging,
          totalOutstanding: payables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0),
          advanceToSuppliers: payables
            .filter(entry => Number(entry.outstandingAmount) < 0)
            .reduce((sum, entry) => sum + Math.abs(Number(entry.outstandingAmount)), 0),
          tradePayables: payables
            .filter(entry => Number(entry.outstandingAmount) > 0)
            .reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0),
        },
      };
    }),

  // Trial balance reconciliation check
  checkTrialBalanceReconciliation: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .query(async ({ input }) => {
      const trialBalance = await db.trialBalanceEntry.findMany({
        where: { companyId: input.companyId },
        include: { majorHead: true },
      });
      
      const receivables = await db.receivableLedgerEntry.findMany({
        where: { companyId: input.companyId },
      });
      const payables = await db.payableLedgerEntry.findMany({
        where: { companyId: input.companyId },
      });

      // Find trial balance entries for receivables and payables
      const tradeReceivablesTB = trialBalance.find(entry => 
        entry.majorHead?.name?.includes('Trade Receivables')
      );
      const tradePayablesTB = trialBalance.find(entry => 
        entry.majorHead?.name?.includes('Trade Payables')
      );

      // Calculate totals from ledgers
      const receivablesTotal = receivables.reduce((sum, entry) => 
        sum + Number(entry.outstandingAmount), 0
      );
      const payablesTotal = payables.reduce((sum, entry) => 
        sum + Number(entry.outstandingAmount), 0
      );

      const receivablesVariance = Number(tradeReceivablesTB?.closingBalanceCY || 0) - receivablesTotal;
      const payablesVariance = Number(tradePayablesTB?.closingBalanceCY || 0) - payablesTotal;

      return {
        receivables: {
          trialBalanceAmount: Number(tradeReceivablesTB?.closingBalanceCY || 0),
          ledgerTotal: receivablesTotal,
          variance: receivablesVariance,
          reconciled: Math.abs(receivablesVariance) < 1, // Allow for rounding differences
        },
        payables: {
          trialBalanceAmount: Number(tradePayablesTB?.closingBalanceCY || 0),
          ledgerTotal: payablesTotal,
          variance: payablesVariance,
          reconciled: Math.abs(payablesVariance) < 1,
        },
      };
    }),

  // Get Minio base URL for client-side operations
  getMinioBaseUrl: baseProcedure.query(async () => {
    const { minioBaseUrl } = await import("../minio");
    return { baseUrl: minioBaseUrl };
  }),

  // Note Selection Management
  getNoteSelections: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.noteSelection.findMany({
        where: { companyId: input.companyId },
        orderBy: { noteRef: 'asc' },
      });
    }),

  addNoteSelection,
  updateNoteSelection,
  deleteNoteSelection,

  updateNoteSelections: baseProcedure
    .input(z.object({
      companyId: z.string(),
      selections: z.array(noteSelectionSchema),
    }))
    .mutation(async ({ input }) => {
      const { companyId, selections } = input;
      const results = [];
      
      for (const selection of selections) {
        const result = await db.noteSelection.upsert({
          where: { 
            companyId_noteRef: {
              companyId,
              noteRef: selection.noteRef
            }
          },
          create: {
            companyId,
            noteRef: selection.noteRef,
            description: `Note for ${selection.noteRef}`, // Placeholder
            userSelected: selection.userSelected,
            finalSelected: selection.userSelected,
          },
          update: {
            userSelected: selection.userSelected,
            finalSelected: selection.userSelected,
          },
        });
        results.push(result);
      }
      return results;
    }),

  updateNoteNumbers,

  // Financial Statement Generation
  generateBalanceSheet: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .query(async ({ input }) => {
      const trialBalance = await db.trialBalanceEntry.findMany({
        where: {
          companyId: input.companyId,
          type: 'BS',
        },
        include: {
          majorHead: true,
          grouping: true,
        },
      });

      // Group by major heads for balance sheet structure
      const assets = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Assets') || 
        entry.majorHead?.name?.includes('Receivables') ||
        entry.majorHead?.name?.includes('Cash') ||
        entry.majorHead?.name?.includes('Inventories') ||
        entry.majorHead?.name?.includes('Investments') ||
        entry.majorHead?.name?.includes('Loans and Advances')
      );

      const liabilities = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Liabilities') ||
        entry.majorHead?.name?.includes('Payables') ||
        entry.majorHead?.name?.includes('Borrowings') ||
        entry.majorHead?.name?.includes('Provisions')
      );

      const equity = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Equity') ||
        entry.majorHead?.name?.includes('Share Capital')
      );

      return {
        assets,
        liabilities,
        equity,
        totalAssets: assets.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
        totalLiabilities: liabilities.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
        totalEquity: equity.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0),
      };
    }),

  generateProfitAndLoss: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .query(async ({ input }) => {
      const trialBalance = await db.trialBalanceEntry.findMany({
        where: {
          companyId: input.companyId,
          type: 'PL',
        },
        include: {
          majorHead: true,
          grouping: true,
        },
      });

      const revenue = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Revenue') ||
        entry.majorHead?.name?.includes('Income')
      );

      const expenses = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Expense') ||
        entry.majorHead?.name?.includes('Cost') ||
        entry.majorHead?.name?.includes('Finance Costs') ||
        entry.majorHead?.name?.includes('Depreciation')
      );

      const totalRevenue = revenue.reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0);
      const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);

      return {
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      };
    }),

  generateCashFlow,
  generateRatioAnalysis,

  // Financial Statement Export Procedures
  exportBalanceSheet,
  exportProfitAndLoss,
  exportCashFlow,
  exportAgingSchedules,
  exportRatioAnalysis,

  // Schedule III Compliance Validation Procedures
  validateScheduleIIICompliance,
  validateNoteCompliance,
  validateFinancialStatementFormat,

  // Debug and troubleshooting procedures
  debugCompliance,

  // Initialize default note selections
  initializeNoteSelections: baseProcedure
    .input(z.object({
      companyId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { companyId } = input;
      
      const defaultNotes = [
        // A - General notes and policies (mandatory)
        { noteRef: "A.1", description: "Corporate information and basis of preparation", linkedMajorHead: null },
        { noteRef: "A.2", description: "Significant accounting policies", linkedMajorHead: null },
        { noteRef: "A.2.1", description: "Revenue recognition (AS 9)", linkedMajorHead: "Revenue from Operations" },
        { noteRef: "A.2.2", description: "Property, Plant and Equipment (PPE) and depreciation (AS 10)", linkedMajorHead: "Property, Plant and Equipment" },
        { noteRef: "A.2.3", description: "Intangible assets and amortization (AS 26)", linkedMajorHead: "Intangible Assets" },
        { noteRef: "A.2.4", description: "Impairment of assets (AS 28)", linkedMajorHead: null },
        { noteRef: "A.2.5", description: "Inventories valuation and cost formula (AS 2)", linkedMajorHead: "Inventories" },
        { noteRef: "A.2.6", description: "Investments classification and valuation (AS 13)", linkedMajorHead: "Non-current Investments" },
        { noteRef: "A.2.7", description: "Foreign currency transactions and translation (AS 11)", linkedMajorHead: null },
        { noteRef: "A.2.8", description: "Employee benefits (AS 15)", linkedMajorHead: "Employee Benefits Expense" },
        { noteRef: "A.2.9", description: "Borrowing costs and capitalization policy (AS 16)", linkedMajorHead: "Finance Costs" },
        { noteRef: "A.2.10", description: "Provisions, contingent liabilities, contingent assets (AS 29)", linkedMajorHead: "Long-term Provisions" },
        { noteRef: "A.2.11", description: "Taxes on income (current/deferred; AS 22)", linkedMajorHead: "Taxes on Income" },
        { noteRef: "A.2.12", description: "Government grants (AS 12)", linkedMajorHead: null },
        { noteRef: "A.2.13", description: "Construction contracts revenue (AS 7)", linkedMajorHead: null },
        { noteRef: "A.2.14", description: "Leases classification (AS 19)", linkedMajorHead: null },
        { noteRef: "A.2.15", description: "Segment reporting basis (AS 17)", linkedMajorHead: null },
        { noteRef: "A.2.16", description: "Cash and cash equivalents definition (AS 3)", linkedMajorHead: "Cash and Cash Equivalents" },

        // B - Equity and liabilities notes
        { noteRef: "B.1", description: "Share capital", linkedMajorHead: "Equity Share Capital" },
        { noteRef: "B.2", description: "Reserves and surplus / other equity", linkedMajorHead: "Other Equity" },
        { noteRef: "B.3", description: "Long-term and short-term borrowings", linkedMajorHead: "Long-term Borrowings" },
        { noteRef: "B.4", description: "Trade payables", linkedMajorHead: "Trade Payables" },
        { noteRef: "B.5", description: "Other financial liabilities and provisions", linkedMajorHead: "Other Current Liabilities" },
        { noteRef: "B.6", description: "Other non-financial liabilities", linkedMajorHead: "Other Long-term Liabilities" },
        { noteRef: "B.7", description: "Employee benefit obligations (AS 15)", linkedMajorHead: "Long-term Provisions" },

        // C - Assets notes
        { noteRef: "C.1", description: "Property, plant and equipment (AS 10 + Schedule III)", linkedMajorHead: "Property, Plant and Equipment" },
        { noteRef: "C.2", description: "Capital work-in-progress (CWIP)", linkedMajorHead: null },
        { noteRef: "C.3", description: "Intangible assets and Intangible assets under development", linkedMajorHead: "Intangible Assets" },
        { noteRef: "C.4", description: "Investments (AS 13)", linkedMajorHead: "Non-current Investments" },
        { noteRef: "C.5", description: "Inventories (AS 2)", linkedMajorHead: "Inventories" },
        { noteRef: "C.6", description: "Trade receivables", linkedMajorHead: "Trade Receivables" },
        { noteRef: "C.7", description: "Cash and cash equivalents", linkedMajorHead: "Cash and Cash Equivalents" },
        { noteRef: "C.8", description: "Loans, advances, and other assets", linkedMajorHead: "Long-term Loans and Advances" },

        // D - Profit and Loss notes
        { noteRef: "D.1", description: "Revenue from operations (AS 9)", linkedMajorHead: "Revenue from Operations" },
        { noteRef: "D.2", description: "Other income", linkedMajorHead: "Other Income" },
        { noteRef: "D.3", description: "Cost of materials consumed; Purchases; Changes in inventories", linkedMajorHead: "Cost of Materials Consumed" },
        { noteRef: "D.4", description: "Employee benefits expense (AS 15)", linkedMajorHead: "Employee Benefits Expense" },
        { noteRef: "D.5", description: "Finance costs (AS 16)", linkedMajorHead: "Finance Costs" },
        { noteRef: "D.6", description: "Depreciation and amortization expense", linkedMajorHead: "Depreciation and Amortization" },
        { noteRef: "D.7", description: "Other expenses (incl. CSR, Auditor Payments)", linkedMajorHead: "Other Expenses" },
        { noteRef: "D.8", description: "Exceptional items and extraordinary items (AS 5)", linkedMajorHead: "Exceptional Items" },
        { noteRef: "D.9", description: "Prior period items disclosure (AS 5)", linkedMajorHead: "Prior Period Items" },
        { noteRef: "D.10", description: "Earnings per share (AS 20)", linkedMajorHead: null },
        { noteRef: "D.11", description: "Income taxes (AS 22)", linkedMajorHead: "Taxes on Income" },

        // E - AS-specific and cross-cutting disclosures
        { noteRef: "E.1", description: "AS 3 Cash Flow Statement details", linkedMajorHead: null },
        { noteRef: "E.2", description: "AS 4 Events occurring after the balance sheet date", linkedMajorHead: null },
        { noteRef: "E.3", description: "AS 18 Related party disclosures", linkedMajorHead: null },
        { noteRef: "E.4", description: "AS 19 Leases", linkedMajorHead: null },
        { noteRef: "E.5", description: "Contingent Liabilities and Commitments (AS 29)", linkedMajorHead: null },

        // F - Additional Schedule III (2021) Disclosures
        { noteRef: "F.1", description: "Utilization of borrowed funds and share premium", linkedMajorHead: null },
        { noteRef: "F.2", description: "Title deeds of immovable properties not in company's name", linkedMajorHead: null },
        { noteRef: "F.3", description: "Proceedings for Benami property", linkedMajorHead: null },
        { noteRef: "F.4", description: "Wilful defaulter status", linkedMajorHead: null },
        { noteRef: "F.5", description: "Relationship with struck-off companies", linkedMajorHead: null },
        { noteRef: "F.6", description: "Crypto/virtual currency holdings", linkedMajorHead: null },
        { noteRef: "F.7", description: "Undisclosed income surrendered in tax assessments", linkedMajorHead: null },
        { noteRef: "F.8", description: "Ratios with variance >25% explanations", linkedMajorHead: null },
        { noteRef: "F.9", description: "Aging schedules: Receivables, Payables, CWIP, Intangibles under dev.", linkedMajorHead: null },
        { noteRef: "F.10", description: "Unspent CSR amounts", linkedMajorHead: null },

        // G - Other Statutory Disclosures
        { noteRef: "G.1", description: "Managerial remuneration (Section 197)", linkedMajorHead: null },
        { noteRef: "G.2", description: "MSME Disclosures (Principal and Interest due)", linkedMajorHead: null },
      ];

      // Clear existing selections for this company
      await db.noteSelection.deleteMany({
        where: { companyId },
      });

      // Create default selections for this company
      for (const note of defaultNotes) {
        await db.noteSelection.create({
          data: {
            companyId,
            noteRef: note.noteRef,
            description: note.description,
            linkedMajorHead: note.linkedMajorHead,
            systemRecommended: true,
            userSelected: false,
            finalSelected: false,
          },
        });
      }

      return { success: true, count: defaultNotes.length };
    }),
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
