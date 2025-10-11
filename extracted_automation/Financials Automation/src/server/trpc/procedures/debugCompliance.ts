import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../main";
import { db } from "../../db";

export const debugCompliance = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const debugInfo = {
        databaseConnection: false,
        tablesStatus: {} as Record<string, { exists: boolean; count: number; error?: string }>,
        basicChecks: {} as Record<string, { status: 'pass' | 'fail'; message: string }>,
        timestamp: new Date().toISOString(),
      };

      // Test 1: Database Connection
      try {
        await db.$queryRaw`SELECT 1`;
        debugInfo.databaseConnection = true;
      } catch (error) {
        debugInfo.databaseConnection = false;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Test 2: Check required tables and data for the specific company
      const tablesToCheck = [
        'commonControl',
        'trialBalanceEntry',
        'noteSelection',
        'receivableLedgerEntry',
        'payableLedgerEntry',
        'ratioAnalysis',
        'relatedPartyTransaction',
        'contingentLiability',
        'accountingPolicyContent',
        'shareCapitalEntry',
        'taxEntry',
        'deferredTaxEntry',
      ];

      for (const table of tablesToCheck) {
        try {
          let count = 0;
          switch (table) {
            case 'commonControl':
              count = await db.commonControl.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'trialBalanceEntry':
              count = await db.trialBalanceEntry.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'noteSelection':
              count = await db.noteSelection.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'receivableLedgerEntry':
              count = await db.receivableLedgerEntry.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'payableLedgerEntry':
              count = await db.payableLedgerEntry.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'ratioAnalysis':
              count = await db.ratioAnalysis.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'relatedPartyTransaction':
              count = await db.relatedPartyTransaction.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'contingentLiability':
              count = await db.contingentLiability.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'accountingPolicyContent':
              count = await db.accountingPolicyContent.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'shareCapitalEntry':
              count = await db.shareCapitalEntry.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'taxEntry':
              count = await db.taxEntry.count({
                where: { companyId: input.companyId }
              });
              break;
            case 'deferredTaxEntry':
              count = await db.deferredTaxEntry.count({
                where: { companyId: input.companyId }
              });
              break;
          }
          
          debugInfo.tablesStatus[table] = {
            exists: true,
            count,
          };
        } catch (error) {
          debugInfo.tablesStatus[table] = {
            exists: false,
            count: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }

      // Test 3: Basic data integrity checks
      
      // Check if major heads are seeded (global data, not company-specific)
      const majorHeadCount = await db.majorHead.count();
      debugInfo.basicChecks.majorHeadsSeeded = {
        status: majorHeadCount > 20 ? 'pass' : 'fail',
        message: `${majorHeadCount} major heads found (expected >20 for proper seeding)`
      };

      // Check if note selections are seeded for this company
      const noteSelectionCount = debugInfo.tablesStatus.noteSelection?.count || 0;
      debugInfo.basicChecks.noteSelectionsSeeded = {
        status: noteSelectionCount > 50 ? 'pass' : 'fail',
        message: `${noteSelectionCount} note selections found for this company (expected >50 for proper seeding)`
      };

      // Check if common control has basic data for this company
      const commonControlCount = debugInfo.tablesStatus.commonControl?.count || 0;
      debugInfo.basicChecks.commonControlConfigured = {
        status: commonControlCount > 0 ? 'pass' : 'fail',
        message: `${commonControlCount} common control records found for this company`
      };

      // Check if trial balance has data for this company
      const trialBalanceCount = debugInfo.tablesStatus.trialBalanceEntry?.count || 0;
      debugInfo.basicChecks.trialBalanceData = {
        status: trialBalanceCount > 0 ? 'pass' : 'fail',
        message: `${trialBalanceCount} trial balance entries found for this company`
      };

      // Test 4: Try to run a simplified version of the compliance check for this company
      try {
        const commonControl = await db.commonControl.findFirst({
          where: { companyId: input.companyId },
          orderBy: { createdAt: 'desc' },
        });
        
        debugInfo.basicChecks.complianceQueryTest = {
          status: 'pass',
          message: `Common control query successful for company. Entity: ${commonControl?.entityName || 'Not configured'}`
        };
      } catch (error) {
        debugInfo.basicChecks.complianceQueryTest = {
          status: 'fail',
          message: `Common control query failed for company: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Test 5: Additional system checks for the specific company
      try {
        // Check if we can perform basic compliance logic for this company
        const commonControl = await db.commonControl.findFirst({
          where: { companyId: input.companyId }
        });
        const trialBalance = await db.trialBalanceEntry.findMany({
          where: { companyId: input.companyId }
        });
        const noteSelections = await db.noteSelection.findMany({
          where: { companyId: input.companyId }
        });
        
        let systemReadiness = true;
        const readinessIssues = [];
        
        if (!commonControl) {
          systemReadiness = false;
          readinessIssues.push('No common control data configured for this company');
        }
        
        if (trialBalance.length === 0) {
          systemReadiness = false;
          readinessIssues.push('No trial balance data available for this company');
        }
        
        if (noteSelections.length === 0) {
          systemReadiness = false;
          readinessIssues.push('No note selections configured for this company');
        }
        
        debugInfo.basicChecks.systemReadiness = {
          status: systemReadiness ? 'pass' : 'fail',
          message: systemReadiness 
            ? 'System appears ready for compliance validation for this company'
            : `System not ready for this company: ${readinessIssues.join(', ')}`
        };
      } catch (error) {
        debugInfo.basicChecks.systemReadiness = {
          status: 'fail',
          message: `System readiness check failed for this company: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      return debugInfo;

    } catch (error) {
      console.error('Error in debugCompliance:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Debug compliance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
