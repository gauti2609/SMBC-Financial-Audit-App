import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { baseProcedure } from "../main";
import { db } from "../../db";

type ComplianceIssue = {
  severity: 'error' | 'warning' | 'info';
  category: string;
  issue: string;
  recommendation: string;
  noteRef?: string;
};

type ComplianceReport = {
  overallStatus: 'compliant' | 'non-compliant' | 'partial';
  complianceScore: number; // 0-100
  totalChecks: number;
  passedChecks: number;
  issues: ComplianceIssue[];
  summary: {
    entityInformation: 'pass' | 'fail' | 'warning';
    mandatoryDisclosures: 'pass' | 'fail' | 'warning';
    noteSelections: 'pass' | 'fail' | 'warning';
    financialStatements: 'pass' | 'fail' | 'warning';
    agingSchedules: 'pass' | 'fail' | 'warning';
    ratioAnalysis: 'pass' | 'fail' | 'warning';
  };
};

export const validateScheduleIIICompliance = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }): Promise<ComplianceReport> => {
    try {
      // Ensure database connection is available
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection not available'
        });
      }

      // Add database connection verification function
      const verifyDbConnection = async () => {
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection not available'
          });
        }
        try {
          await db.$queryRaw`SELECT 1`;
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Database connection verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      };

      // Verify database connection before proceeding
      try {
        await db.$queryRaw`SELECT 1`;
      } catch (connectionError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Database connection failed: ${connectionError instanceof Error ? connectionError.message : 'Unknown connection error'}`
        });
      }

      const issues: ComplianceIssue[] = [];
      let totalChecks = 0;
      let passedChecks = 0;

      // Verify connection before entity information check
      await verifyDbConnection();

      // Check 1: Entity Information Completeness (Enhanced)
      totalChecks += 5; // Breaking into sub-checks
      const commonControl = await db.commonControl.findFirst({
        where: { companyId: input.companyId },
        orderBy: { createdAt: 'desc' },
      });

      if (!commonControl) {
        issues.push({
          severity: 'error',
          category: 'Entity Information',
          issue: 'Common control data not configured',
          recommendation: 'Configure entity details in Common Control settings'
        });
      } else {
        if (commonControl.entityName) passedChecks++;
        else issues.push({
          severity: 'error',
          category: 'Entity Information',
          issue: 'Entity name is missing',
          recommendation: 'Provide entity name in Common Control settings'
        });

        if (commonControl.address) passedChecks++;
        else issues.push({
          severity: 'error',
          category: 'Entity Information',
          issue: 'Entity address is missing',
          recommendation: 'Provide complete address in Common Control settings'
        });

        if (commonControl.cinNumber) passedChecks++;
        else issues.push({
          severity: 'warning',
          category: 'Entity Information',
          issue: 'CIN number is missing',
          recommendation: 'Provide Corporate Identification Number for compliance'
        });

        if (commonControl.financialYearStart && commonControl.financialYearEnd) {
          passedChecks++;
          // Additional validation for financial year
          const startDate = new Date(commonControl.financialYearStart);
          const endDate = new Date(commonControl.financialYearEnd);
          const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           (endDate.getMonth() - startDate.getMonth());
          
          if (diffMonths !== 12) {
            issues.push({
              severity: 'warning',
              category: 'Entity Information',
              issue: 'Financial year period is not 12 months',
              recommendation: 'Ensure financial year is exactly 12 months for Schedule III compliance'
            });
          }
        } else {
          issues.push({
            severity: 'error',
            category: 'Entity Information',
            issue: 'Financial year dates are missing',
            recommendation: 'Set financial year start and end dates'
          });
        }

        if (commonControl.currency && commonControl.units) passedChecks++;
        else issues.push({
          severity: 'warning',
          category: 'Entity Information',
          issue: 'Currency or reporting units not specified',
          recommendation: 'Specify currency and reporting units (Lakhs/Crores/Millions)'
        });
      }

      // Verify connection before trial balance check
      await verifyDbConnection();

      // Check 2: Trial Balance Completeness and Balance (Enhanced)
      totalChecks += 3;
      const trialBalance = await db.trialBalanceEntry.findMany({
        where: { companyId: input.companyId },
        include: { majorHead: true }
      });
      
      if (trialBalance.length === 0) {
        issues.push({
          severity: 'error',
          category: 'Financial Statements',
          issue: 'No trial balance data available',
          recommendation: 'Upload trial balance data to generate financial statements'
        });
      } else {
        passedChecks++;
        
        // Check Balance Sheet balance
        const bsEntries = trialBalance.filter(entry => entry.type === 'BS');
        const assets = bsEntries.filter(entry => 
          entry.majorHead?.name?.includes('Assets') ||
          entry.majorHead?.name?.includes('Receivables') ||
          entry.majorHead?.name?.includes('Cash') ||
          entry.majorHead?.name?.includes('Inventories')
        );
        const liabilitiesAndEquity = bsEntries.filter(entry => 
          entry.majorHead?.name?.includes('Liabilities') ||
          entry.majorHead?.name?.includes('Payables') ||
          entry.majorHead?.name?.includes('Equity') ||
          entry.majorHead?.name?.includes('Share Capital')
        );

        const totalAssets = assets.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);
        const totalLiabilitiesEquity = liabilitiesAndEquity.reduce((sum, item) => 
          sum + Math.abs(Number(item.closingBalanceCY)), 0);

        if (Math.abs(totalAssets - totalLiabilitiesEquity) < 1) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'Financial Statements',
            issue: `Balance Sheet does not balance. Assets: ${totalAssets}, Liabilities+Equity: ${totalLiabilitiesEquity}`,
            recommendation: 'Ensure Assets = Liabilities + Equity in trial balance data'
          });
        }

        // Check for previous year data
        const entriesWithPYData = trialBalance.filter(entry => Number(entry.closingBalancePY) !== 0);
        if (entriesWithPYData.length > 0) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'warning',
            category: 'Financial Statements',
            issue: 'No previous year data found in trial balance',
            recommendation: 'Provide previous year figures for comparative analysis'
          });
        }
      }

      // Verify connection before note selections check
      await verifyDbConnection();

      // Check 3: Mandatory Note Selections (Enhanced)
      totalChecks += 2;
      const noteSelections = await db.noteSelection.findMany({
        where: { companyId: input.companyId },
      });
      const mandatoryNotes = [
        'A.1', 'A.2', // Corporate information and accounting policies
        'F.8', 'F.9', // Ratio variance explanations and aging schedules
      ];

      let mandatoryNotesSelected = true;
      for (const mandatoryNote of mandatoryNotes) {
        const note = noteSelections.find(n => n.noteRef === mandatoryNote);
        if (!note || !note.finalSelected) {
          issues.push({
            severity: 'error',
            category: 'Mandatory Disclosures',
            issue: `Mandatory note ${mandatoryNote} is not selected`,
            recommendation: `Select note ${mandatoryNote} in Notes Selection`,
            noteRef: mandatoryNote
          });
          mandatoryNotesSelected = false;
        }
      }
      if (mandatoryNotesSelected) passedChecks++;

      // Check for recommended notes based on data availability (with proper db checks)
      const recommendedNotes = [
        { 
          noteRef: 'B.1', 
          dataCheck: async () => {
            if (!db) return false;
            try {
              return (await db.shareCapitalEntry.findMany({
                where: { companyId: input.companyId }
              })).length > 0;
            } catch (error) {
              console.error('Error checking share capital entries:', error);
              return false;
            }
          }
        },
        { 
          noteRef: 'C.1', 
          dataCheck: async () => {
            if (!db) return false;
            try {
              return (await db.ppeScheduleEntry.findMany({
                where: { companyId: input.companyId }
              })).length > 0;
            } catch (error) {
              console.error('Error checking PPE schedule entries:', error);
              return false;
            }
          }
        },
        { 
          noteRef: 'C.4', 
          dataCheck: async () => {
            if (!db) return false;
            try {
              return (await db.investmentEntry.findMany({
                where: { companyId: input.companyId }
              })).length > 0;
            } catch (error) {
              console.error('Error checking investment entries:', error);
              return false;
            }
          }
        },
        { 
          noteRef: 'D.4', 
          dataCheck: async () => {
            if (!db) return false;
            try {
              return (await db.employeeBenefitEntry.findMany({
                where: { companyId: input.companyId }
              })).length > 0;
            } catch (error) {
              console.error('Error checking employee benefit entries:', error);
              return false;
            }
          }
        },
        { 
          noteRef: 'E.3', 
          dataCheck: async () => {
            if (!db) return false;
            try {
              return (await db.relatedPartyTransaction.findMany({
                where: { companyId: input.companyId }
              })).length > 0;
            } catch (error) {
              console.error('Error checking related party transactions:', error);
              return false;
            }
          }
        },
        { 
          noteRef: 'E.5', 
          dataCheck: async () => {
            if (!db) return false;
            try {
              return (await db.contingentLiability.findMany({
                where: { companyId: input.companyId }
              })).length > 0;
            } catch (error) {
              console.error('Error checking contingent liabilities:', error);
              return false;
            }
          }
        },
      ];

      let recommendedNotesCount = 0;
      for (const recNote of recommendedNotes) {
        const hasData = await recNote.dataCheck();
        if (hasData) {
          recommendedNotesCount++;
          const note = noteSelections.find(n => n.noteRef === recNote.noteRef);
          if (!note || !note.finalSelected) {
            issues.push({
              severity: 'warning',
              category: 'Note Selection',
              issue: `Note ${recNote.noteRef} should be selected as relevant data exists`,
              recommendation: `Consider selecting note ${recNote.noteRef} based on available data`,
              noteRef: recNote.noteRef
            });
          }
        }
      }
      if (recommendedNotesCount > 0) passedChecks++;

      // Verify connection before aging schedules check
      await verifyDbConnection();

      // Check 4: Detailed Aging Schedules Compliance (Enhanced)
      totalChecks += 4;
      const receivables = await db.receivableLedgerEntry.findMany({
        where: { companyId: input.companyId },
      });
      const payables = await db.payableLedgerEntry.findMany({
        where: { companyId: input.companyId },
      });

      if (receivables.length > 0) {
        passedChecks++;
        
        // Check aging bucket distribution
        const agingBuckets = ['< 182 Days', '182-365 Days', '1-2 Years', '2-3 Years', '> 3 Years'];
        const invalidBuckets = receivables.filter(entry => 
          !entry.agingBucket || !agingBuckets.includes(entry.agingBucket)
        );
        
        if (invalidBuckets.length === 0) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'Aging Schedules',
            issue: `${invalidBuckets.length} receivable entries have invalid aging buckets`,
            recommendation: 'Ensure all receivables are classified into proper Schedule III aging buckets',
            noteRef: 'F.9'
          });
        }

        // Check for disputed receivables disclosure
        const disputedReceivables = receivables.filter(entry => entry.disputed);
        if (disputedReceivables.length > 0) {
          const totalDisputed = disputedReceivables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0);
          const totalReceivables = receivables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0);
          const disputedPercentage = (totalDisputed / totalReceivables) * 100;
          
          if (disputedPercentage > 5) {
            issues.push({
              severity: 'info',
              category: 'Aging Schedules',
              issue: `${disputedPercentage.toFixed(1)}% of receivables are disputed`,
              recommendation: 'Consider additional disclosure for significant disputed receivables',
              noteRef: 'F.9'
            });
          }
        }
      } else {
        issues.push({
          severity: 'warning',
          category: 'Aging Schedules',
          issue: 'No receivables data available for aging analysis',
          recommendation: 'Upload receivables data for Schedule III aging disclosure'
        });
      }

      if (payables.length > 0) {
        passedChecks++;
        
        // Check MSME compliance
        const msmePayables = payables.filter(entry => entry.payableType === 'MSME');
        const totalMSME = msmePayables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0);
        const totalPayables = payables.reduce((sum, entry) => sum + Number(entry.outstandingAmount), 0);
        
        if (msmePayables.length === 0) {
          issues.push({
            severity: 'info',
            category: 'MSME Compliance',
            issue: 'No MSME payables identified',
            recommendation: 'Review payables for MSME classification as required by Schedule III',
            noteRef: 'G.2'
          });
        } else if (totalMSME / totalPayables > 0.1) { // More than 10%
          issues.push({
            severity: 'info',
            category: 'MSME Compliance',
            issue: `MSME payables represent ${((totalMSME/totalPayables)*100).toFixed(1)}% of total payables`,
            recommendation: 'Ensure proper MSME disclosures are made as per Schedule III requirements',
            noteRef: 'G.2'
          });
        }
      }

      // Verify connection before ratio analysis check
      await verifyDbConnection();

      // Check 5: Ratio Analysis Variance Explanations (Enhanced)
      totalChecks += 3;
      const ratioAnalysisData = await db.ratioAnalysis.findMany({
        where: { companyId: input.companyId },
      });
      
      if (ratioAnalysisData.length > 0) {
        passedChecks++;
        
        const ratiosRequiringExplanation = ratioAnalysisData.filter(
          ratio => Math.abs(Number(ratio.variancePercentage)) > 25
        );
        
        if (ratiosRequiringExplanation.length > 0) {
          const ratiosWithoutExplanation = ratiosRequiringExplanation.filter(
            ratio => !ratio.explanation || ratio.explanation.trim() === ''
          );
          
          if (ratiosWithoutExplanation.length === 0) {
            passedChecks++;
          } else {
            issues.push({
              severity: 'error',
              category: 'Ratio Analysis',
              issue: `${ratiosWithoutExplanation.length} ratios with >25% variance lack explanations`,
              recommendation: 'Provide explanations for all ratios with variance >25% as per Schedule III requirement',
              noteRef: 'F.8'
            });
          }

          // Check quality of explanations
          const shortExplanations = ratiosRequiringExplanation.filter(
            ratio => ratio.explanation && ratio.explanation.trim().length < 50
          );
          
          if (shortExplanations.length === 0) {
            passedChecks++;
          } else {
            issues.push({
              severity: 'warning',
              category: 'Ratio Analysis',
              issue: `${shortExplanations.length} ratio explanations are too brief`,
              recommendation: 'Provide detailed explanations for ratio variances (minimum 50 characters)',
              noteRef: 'F.8'
            });
          }
        } else {
          passedChecks += 2; // No ratios requiring explanation
        }
      } else {
        issues.push({
          severity: 'warning',
          category: 'Ratio Analysis',
          issue: 'No ratio analysis data available',
          recommendation: 'Generate ratio analysis to check for variances >25% requiring explanation'
        });
      }

      // Verify connection before related party check
      await verifyDbConnection();

      // Check 6: Related Party Disclosures (Enhanced)
      totalChecks += 2;
      const relatedPartyTransactions = await db.relatedPartyTransaction.findMany({
        where: { companyId: input.companyId },
      });
      const relatedPartyNote = noteSelections.find(n => n.noteRef === 'E.3');
      
      if (relatedPartyTransactions.length > 0) {
        if (relatedPartyNote && relatedPartyNote.finalSelected) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'Related Party Disclosures',
            issue: 'Related party transactions exist but note E.3 is not selected',
            recommendation: 'Select note E.3 (AS 18 Related party disclosures) when related party transactions exist',
            noteRef: 'E.3'
          });
        }

        // Check for KMP transactions disclosure
        const kmpTransactions = relatedPartyTransactions.filter(txn => 
          txn.relationship.toLowerCase().includes('key management') ||
          txn.relationship.toLowerCase().includes('director')
        );
        
        if (kmpTransactions.length > 0) {
          const totalKMPAmount = kmpTransactions.reduce((sum, txn) => sum + Number(txn.amountCY), 0);
          if (totalKMPAmount > 0) {
            passedChecks++;
            issues.push({
              severity: 'info',
              category: 'Related Party Disclosures',
              issue: `Key Management Personnel transactions: ₹${totalKMPAmount.toLocaleString()}`,
              recommendation: 'Ensure adequate disclosure of KMP remuneration and transactions',
              noteRef: 'E.3'
            });
          }
        } else {
          issues.push({
            severity: 'warning',
            category: 'Related Party Disclosures',
            issue: 'No Key Management Personnel transactions identified',
            recommendation: 'Review if KMP transactions need to be disclosed'
          });
        }
      } else {
        passedChecks += 2; // No related party transactions
      }

      // Verify connection before contingent liabilities check
      await verifyDbConnection();

      // Check 7: Contingent Liabilities and Commitments (Enhanced)
      totalChecks += 2;
      const contingentLiabilities = await db.contingentLiability.findMany({
        where: { companyId: input.companyId },
      });
      const contingentLiabilityNote = noteSelections.find(n => n.noteRef === 'E.5');
      
      if (contingentLiabilities.length > 0) {
        if (contingentLiabilityNote && contingentLiabilityNote.finalSelected) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'Contingent Liabilities',
            issue: 'Contingent liabilities exist but note E.5 is not selected',
            recommendation: 'Select note E.5 (Contingent Liabilities and Commitments) when contingent liabilities exist',
            noteRef: 'E.5'
          });
        }

        // Analyze contingent liabilities vs commitments
        const contingentLiabs = contingentLiabilities.filter(cl => cl.type === 'Contingent Liability');
        const commitments = contingentLiabilities.filter(cl => cl.type === 'Commitment');
        
        const totalContingent = contingentLiabs.reduce((sum, cl) => sum + Number(cl.amountCY), 0);
        const totalCommitments = commitments.reduce((sum, cl) => sum + Number(cl.amountCY), 0);
        
        if (totalContingent > 0 || totalCommitments > 0) {
          passedChecks++;
          issues.push({
            severity: 'info',
            category: 'Contingent Liabilities',
            issue: `Contingent Liabilities: ₹${totalContingent.toLocaleString()}, Commitments: ₹${totalCommitments.toLocaleString()}`,
            recommendation: 'Ensure proper classification and disclosure of contingent liabilities vs commitments',
            noteRef: 'E.5'
          });
        }
      } else {
        passedChecks += 2; // No contingent liabilities
      }

      // Verify connection before accounting policies check
      await verifyDbConnection();

      // Check 8: Accounting Policies Content (Enhanced)
      totalChecks += 3;
      const accountingPolicies = await db.accountingPolicyContent.findMany({
        where: { companyId: input.companyId },
      });
      const accountingPolicyNote = noteSelections.find(n => n.noteRef === 'A.2');
      
      if (accountingPolicyNote && accountingPolicyNote.finalSelected) {
        passedChecks++;
        
        if (accountingPolicies.length > 0) {
          passedChecks++;
          
          // Check for key policy areas
          const keyPolicyAreas = [
            'Revenue Recognition',
            'Property, Plant and Equipment',
            'Depreciation',
            'Inventories',
            'Employee Benefits',
            'Income Taxes'
          ];
          
          const missingPolicies = keyPolicyAreas.filter(area => 
            !accountingPolicies.some(policy => 
              policy.title.toLowerCase().includes(area.toLowerCase()) ||
              policy.content.toLowerCase().includes(area.toLowerCase())
            )
          );
          
          if (missingPolicies.length === 0) {
            passedChecks++;
          } else {
            issues.push({
              severity: 'warning',
              category: 'Accounting Policies',
              issue: `Missing policies for: ${missingPolicies.join(', ')}`,
              recommendation: 'Consider adding policies for all significant accounting areas',
              noteRef: 'A.2'
            });
          }
        } else {
          issues.push({
            severity: 'error',
            category: 'Accounting Policies',
            issue: 'Accounting policies note is selected but has no content',
            recommendation: 'Add content to accounting policies or initialize default policies',
            noteRef: 'A.2'
          });
        }
      } else {
        issues.push({
          severity: 'error',
          category: 'Accounting Policies',
          issue: 'Significant accounting policies note (A.2) is not selected',
          recommendation: 'Select and populate note A.2 (Significant accounting policies)',
          noteRef: 'A.2'
        });
      }

      // Verify connection before share capital check
      await verifyDbConnection();

      // Check 9: Share Capital Compliance (New)
      totalChecks += 2;
      const shareCapitalEntries = await db.shareCapitalEntry.findMany({
        where: { companyId: input.companyId },
      });
      const shareCapitalNote = noteSelections.find(n => n.noteRef === 'B.1');
      
      if (shareCapitalEntries.length > 0) {
        if (shareCapitalNote && shareCapitalNote.finalSelected) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'warning',
            category: 'Share Capital',
            issue: 'Share capital data exists but note B.1 is not selected',
            recommendation: 'Select note B.1 for share capital disclosure',
            noteRef: 'B.1'
          });
        }

        // Check for shareholding pattern disclosure
        const totalShares = shareCapitalEntries.reduce((sum, entry) => sum + Number(entry.numberOfShares), 0);
        const entriesWithPercentage = shareCapitalEntries.filter(entry => entry.holdingPercentageCY);
        
        if (entriesWithPercentage.length > 0) {
          const totalPercentage = entriesWithPercentage.reduce((sum, entry) => sum + Number(entry.holdingPercentageCY || 0), 0);
          if (Math.abs(totalPercentage - 100) < 1) {
            passedChecks++;
          } else {
            issues.push({
              severity: 'warning',
              category: 'Share Capital',
              issue: `Shareholding percentages total ${totalPercentage}%, not 100%`,
              recommendation: 'Ensure shareholding percentages add up to 100%',
              noteRef: 'B.1'
            });
          }
        } else {
          issues.push({
            severity: 'info',
            category: 'Share Capital',
            issue: 'No shareholding percentage information provided',
            recommendation: 'Consider providing shareholding pattern for better disclosure'
          });
        }
      } else {
        passedChecks += 2; // No share capital data
      }

      // Verify connection before tax compliance check
      await verifyDbConnection();

      // Check 10: Tax Compliance (New)
      totalChecks += 2;
      const taxEntries = await db.taxEntry.findMany({
        where: { companyId: input.companyId },
      });
      const deferredTaxEntries = await db.deferredTaxEntry.findMany({
        where: { companyId: input.companyId },
      });
      
      if (taxEntries.length > 0) {
        passedChecks++;
        
        // Check for current vs deferred tax breakdown
        const currentTaxEntries = taxEntries.filter(entry => 
          entry.particulars.toLowerCase().includes('current') ||
          entry.particulars.toLowerCase().includes('provision')
        );
        const deferredTaxFromTaxEntries = taxEntries.filter(entry => 
          entry.particulars.toLowerCase().includes('deferred')
        );
        
        if (currentTaxEntries.length > 0 || deferredTaxFromTaxEntries.length > 0 || deferredTaxEntries.length > 0) {
          passedChecks++;
          
          if (deferredTaxEntries.length > 0) {
            const netDeferredTaxAsset = deferredTaxEntries.reduce((sum, entry) => sum + Number(entry.deferredTaxAsset), 0);
            const netDeferredTaxLiability = deferredTaxEntries.reduce((sum, entry) => sum + Number(entry.deferredTaxLiability), 0);
            
            if (netDeferredTaxAsset > 0 || netDeferredTaxLiability > 0) {
              issues.push({
                severity: 'info',
                category: 'Tax Compliance',
                issue: `Deferred Tax Asset: ₹${netDeferredTaxAsset.toLocaleString()}, Liability: ₹${netDeferredTaxLiability.toLocaleString()}`,
                recommendation: 'Ensure proper disclosure of deferred tax assets and liabilities',
                noteRef: 'D.11'
              });
            }
          }
        } else {
          issues.push({
            severity: 'warning',
            category: 'Tax Compliance',
            issue: 'No current or deferred tax breakdown provided',
            recommendation: 'Provide breakdown of current tax and deferred tax components'
          });
        }
      } else {
        issues.push({
          severity: 'warning',
          category: 'Tax Compliance',
          issue: 'No tax entries found',
          recommendation: 'Add tax expense details for proper disclosure'
        });
      }

      // Check 11: CWIP and Intangible Assets Under Development Aging (New Schedule III requirement)
      totalChecks += 3;
      const cwipEntries = await db.cwipScheduleEntry.findMany({
        where: { companyId: input.companyId },
      });
      const intangibleEntries = await db.intangibleScheduleEntry.findMany({
        where: { companyId: input.companyId },
      });
      
      if (cwipEntries.length > 0) {
        passedChecks++;
        
        // Check CWIP aging compliance
        const cwipWithoutAging = cwipEntries.filter(entry => !entry.agingBucket);
        if (cwipWithoutAging.length === 0) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'CWIP Aging',
            issue: `${cwipWithoutAging.length} CWIP entries lack aging bucket classification`,
            recommendation: 'Classify all CWIP into aging buckets: <1 Year, 1-2 Years, 2-3 Years, >3 Years',
            noteRef: 'C.2'
          });
        }
        
        // Check for projects suspended for >1 year
        const oldCWIP = cwipEntries.filter(entry => 
          entry.agingBucket && (entry.agingBucket.includes('2-3') || entry.agingBucket.includes('>3'))
        );
        if (oldCWIP.length > 0) {
          const totalOldCWIP = oldCWIP.reduce((sum, entry) => sum + Number(entry.amountCY), 0);
          issues.push({
            severity: 'warning',
            category: 'CWIP Aging',
            issue: `CWIP of ₹${totalOldCWIP.toLocaleString()} is >2 years old`,
            recommendation: 'Consider additional disclosure for projects delayed beyond expected completion',
            noteRef: 'C.2'
          });
        }
      } else {
        passedChecks += 2; // No CWIP data
      }
      
      if (intangibleEntries.length > 0) {
        const intangibleUnderDev = intangibleEntries.filter(entry => entry.agingBucket);
        if (intangibleUnderDev.length > 0) {
          passedChecks++;
          issues.push({
            severity: 'info',
            category: 'Intangible Assets',
            issue: `${intangibleUnderDev.length} intangible assets under development found`,
            recommendation: 'Ensure proper aging disclosure for intangible assets under development',
            noteRef: 'C.3'
          });
        }
      } else {
        passedChecks++; // No intangible under development
      }

      // Check 12: Revenue Recognition Compliance (AS 9)
      totalChecks += 2;
      const revenueEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Revenue') ||
        entry.majorHead?.name?.includes('Sales')
      );
      
      if (revenueEntries.length > 0) {
        passedChecks++;
        
        const totalRevenue = revenueEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        const totalRevenuePY = revenueEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalancePY)), 0);
        
        if (totalRevenuePY > 0) {
          const revenueGrowth = ((totalRevenue - totalRevenuePY) / totalRevenuePY) * 100;
          if (Math.abs(revenueGrowth) > 50) {
            issues.push({
              severity: 'warning',
              category: 'Revenue Recognition',
              issue: `Revenue growth/decline of ${revenueGrowth.toFixed(1)}% requires explanation`,
              recommendation: 'Provide detailed explanation for significant revenue changes',
              noteRef: 'D.1'
            });
          } else {
            passedChecks++;
          }
        } else {
          passedChecks++; // First year operations
        }
      } else {
        issues.push({
          severity: 'error',
          category: 'Revenue Recognition',
          issue: 'No revenue entries found in trial balance',
          recommendation: 'Ensure revenue accounts are properly classified in trial balance'
        });
      }

      // Check 13: Borrowings and Interest Coverage
      totalChecks += 2;
      const borrowingEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Borrowings') ||
        entry.majorHead?.name?.includes('Loans')
      );
      const interestEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Finance Costs') ||
        entry.majorHead?.name?.includes('Interest')
      );
      
      if (borrowingEntries.length > 0) {
        passedChecks++;
        
        const totalBorrowings = borrowingEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        const totalInterest = interestEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        
        if (totalBorrowings > 0 && totalInterest === 0) {
          issues.push({
            severity: 'warning',
            category: 'Borrowings',
            issue: `Borrowings of ₹${totalBorrowings.toLocaleString()} but no interest expense recorded`,
            recommendation: 'Verify if interest expense should be recorded or if borrowings are interest-free',
            noteRef: 'B.3'
          });
        } else {
          passedChecks++;
        }
      } else {
        passedChecks += 2; // No borrowings
      }

      // Check 14: Inventory Valuation and Movement
      totalChecks += 2;
      const inventoryEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Inventories') ||
        entry.majorHead?.name?.includes('Stock')
      );
      const cogsSalesEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Cost of Goods Sold') ||
        entry.majorHead?.name?.includes('Cost of Materials')
      );
      
      if (inventoryEntries.length > 0) {
        passedChecks++;
        
        const totalInventory = inventoryEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        const totalCOGS = cogsSalesEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        
        if (totalInventory > 0 && totalCOGS === 0) {
          issues.push({
            severity: 'warning',
            category: 'Inventory',
            issue: `Inventory of ₹${totalInventory.toLocaleString()} but no cost of goods sold`,
            recommendation: 'Verify inventory movement and cost allocation',
            noteRef: 'C.5'
          });
        } else {
          passedChecks++;
        }
      } else {
        passedChecks += 2; // No inventory
      }

      // Check 15: Depreciation Policy Consistency
      totalChecks += 2;
      const depreciationEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Depreciation') ||
        entry.majorHead?.name?.includes('Amortization')
      );
      const ppeScheduleEntries = await db.ppeScheduleEntry.findMany({
        where: { companyId: input.companyId },
      });
      
      if (depreciationEntries.length > 0 && ppeScheduleEntries.length > 0) {
        passedChecks++;
        
        const totalDepreciationExpense = depreciationEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        const totalDepreciationFromSchedule = ppeScheduleEntries.reduce((sum, entry) => sum + Number(entry.depreciationForYear), 0);
        
        const depreciationVariance = Math.abs(totalDepreciationExpense - totalDepreciationFromSchedule);
        if (depreciationVariance < totalDepreciationExpense * 0.05) { // 5% tolerance
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'Depreciation',
            issue: `Depreciation expense (₹${totalDepreciationExpense.toLocaleString()}) doesn't match PPE schedule (₹${totalDepreciationFromSchedule.toLocaleString()})`,
            recommendation: 'Reconcile depreciation expense with PPE schedule calculations',
            noteRef: 'C.1'
          });
        }
      } else {
        passedChecks += 2; // No depreciation or PPE
      }

      // Check 16: Cash Flow Statement Preparability
      totalChecks += 3;
      const cashEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Cash') ||
        entry.majorHead?.name?.includes('Bank')
      );
      
      if (cashEntries.length > 0) {
        passedChecks++;
        
        const totalCashCY = cashEntries.reduce((sum, entry) => sum + Number(entry.closingBalanceCY), 0);
        const totalCashPY = cashEntries.reduce((sum, entry) => sum + Number(entry.closingBalancePY), 0);
        
        if (totalCashPY !== 0) {
          passedChecks++;
          
          // Check if we have sufficient data for cash flow preparation
          const hasOperatingData = trialBalance.some(entry => entry.type === 'PL');
          const hasInvestingData = depreciationEntries.length > 0 || ppeScheduleEntries.length > 0;
          const hasFinancingData = borrowingEntries.length > 0 || shareCapitalEntries.length > 0;
          
          if (hasOperatingData && hasInvestingData && hasFinancingData) {
            passedChecks++;
          } else {
            const missingData = [];
            if (!hasOperatingData) missingData.push('operating activities');
            if (!hasInvestingData) missingData.push('investing activities');
            if (!hasFinancingData) missingData.push('financing activities');
            
            issues.push({
              severity: 'warning',
              category: 'Cash Flow',
              issue: `Insufficient data for cash flow statement: missing ${missingData.join(', ')}`,
              recommendation: 'Ensure all cash flow categories have supporting data',
              noteRef: 'E.1'
            });
          }
        } else {
          issues.push({
            severity: 'warning',
            category: 'Cash Flow',
            issue: 'No previous year cash balance for cash flow statement preparation',
            recommendation: 'Provide opening cash balance for cash flow statement'
          });
        }
      } else {
        issues.push({
          severity: 'error',
          category: 'Cash Flow',
          issue: 'No cash and bank accounts found',
          recommendation: 'Add cash and bank balances to trial balance'
        });
      }

      // Check 17: Segment Reporting Requirements (if applicable)
      totalChecks += 1;
      const segmentNote = noteSelections.find(n => n.noteRef === 'A.2.15');
      if (segmentNote && segmentNote.finalSelected) {
        // If segment reporting is selected, check if revenue justifies it
        const totalRevenue = revenueEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        if (totalRevenue > 50000000) { // 5 crores threshold (example)
          passedChecks++;
          issues.push({
            severity: 'info',
            category: 'Segment Reporting',
            issue: 'Segment reporting may be applicable based on revenue size',
            recommendation: 'Ensure proper segment disclosures if required by AS 17',
            noteRef: 'A.2.15'
          });
        } else {
          issues.push({
            severity: 'info',
            category: 'Segment Reporting',
            issue: 'Segment reporting selected but revenue may not justify requirement',
            recommendation: 'Review if segment reporting is actually required'
          });
        }
      } else {
        passedChecks++; // Not applicable
      }

      // Check 18: Provisions and Contingencies Adequacy
      totalChecks += 2;
      const provisionEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Provisions')
      );
      
      if (provisionEntries.length > 0 || contingentLiabilities.length > 0) {
        passedChecks++;
        
        const totalProvisions = provisionEntries.reduce((sum, entry) => sum + Math.abs(Number(entry.closingBalanceCY)), 0);
        const totalContingentLiabs = contingentLiabilities.reduce((sum, entry) => sum + Number(entry.amountCY), 0);
        
        if (totalProvisions > 0 && totalContingentLiabs > 0) {
          const ratio = totalContingentLiabs / totalProvisions;
          if (ratio > 5) { // Contingent liabilities > 5x provisions
            issues.push({
              severity: 'warning',
              category: 'Provisions',
              issue: `Contingent liabilities (₹${totalContingentLiabs.toLocaleString()}) are significantly higher than provisions (₹${totalProvisions.toLocaleString()})`,
              recommendation: 'Review if some contingent liabilities should be recognized as provisions',
              noteRef: 'E.5'
            });
          } else {
            passedChecks++;
          }
        } else {
          passedChecks++; // Only one type exists
        }
      } else {
        passedChecks += 2; // No provisions or contingencies
      }

      // Check 19: Foreign Currency Transactions (if applicable)
      totalChecks += 1;
      const forexNote = noteSelections.find(n => n.noteRef === 'A.2.7');
      const forexEntries = trialBalance.filter(entry => 
        entry.ledgerName.toLowerCase().includes('forex') ||
        entry.ledgerName.toLowerCase().includes('foreign') ||
        entry.ledgerName.toLowerCase().includes('exchange')
      );
      
      if (forexEntries.length > 0) {
        if (forexNote && forexNote.finalSelected) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'warning',
            category: 'Foreign Currency',
            issue: 'Foreign currency transactions detected but AS 11 policy not selected',
            recommendation: 'Select note A.2.7 for foreign currency policy if applicable',
            noteRef: 'A.2.7'
          });
        }
      } else {
        passedChecks++; // No forex transactions
      }

      // Check 20: Earnings Per Share Calculation (if applicable)
      totalChecks += 2;
      const epsNote = noteSelections.find(n => n.noteRef === 'D.10');
      const netProfitEntries = trialBalance.filter(entry => 
        entry.majorHead?.name?.includes('Profit') ||
        entry.ledgerName.toLowerCase().includes('profit')
      );
      
      if (shareCapitalEntries.length > 0 && netProfitEntries.length > 0) {
        if (epsNote && epsNote.finalSelected) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'warning',
            category: 'Earnings Per Share',
            issue: 'EPS calculation may be required but note D.10 not selected',
            recommendation: 'Consider selecting note D.10 for EPS disclosure as per AS 20',
            noteRef: 'D.10'
          });
        }
        
        // Check if EPS calculation is feasible
        const totalShares = shareCapitalEntries.reduce((sum, entry) => sum + Number(entry.numberOfShares), 0);
        if (totalShares > 0) {
          passedChecks++;
        } else {
          issues.push({
            severity: 'error',
            category: 'Earnings Per Share',
            issue: 'Cannot calculate EPS: number of shares not specified in share capital',
            recommendation: 'Provide number of shares in share capital schedule for EPS calculation'
          });
        }
      } else {
        passedChecks += 2; // Not applicable
      }

      // Calculate compliance score and status
      const complianceScore = Math.round((passedChecks / totalChecks) * 100);
      let overallStatus: 'compliant' | 'non-compliant' | 'partial';
      
      if (complianceScore >= 90) {
        overallStatus = 'compliant';
      } else if (complianceScore >= 60) {
        overallStatus = 'partial';
      } else {
        overallStatus = 'non-compliant';
      }

      // Generate enhanced summary
      const summary = {
        entityInformation: (commonControl && commonControl.entityName && commonControl.address && 
                          commonControl.financialYearStart && commonControl.financialYearEnd) ? 'pass' : 'fail',
        mandatoryDisclosures: (noteSelections.some(n => n.noteRef === 'A.1' && n.finalSelected) &&
                              noteSelections.some(n => n.noteRef === 'A.2' && n.finalSelected)) ? 'pass' : 'fail',
        noteSelections: noteSelections.length > 0 ? 'pass' : 'fail',
        financialStatements: trialBalance.length > 0 ? 'pass' : 'fail',
        agingSchedules: (receivables.length > 0 || payables.length > 0) ? 'pass' : 'warning',
        ratioAnalysis: ratioAnalysisData.length > 0 ? 'pass' : 'warning'
      } as const;

      return {
        overallStatus,
        complianceScore,
        totalChecks,
        passedChecks,
        issues,
        summary
      };

    } catch (error) {
      console.error('Error in validateScheduleIIICompliance:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to validate Schedule III compliance: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const validateNoteCompliance = baseProcedure
  .input(z.object({
    companyId: z.string(),
    noteRef: z.string()
  }))
  .query(async ({ input }) => {
    try {
      // Ensure database connection is available
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection not available'
        });
      }

      const note = await db.noteSelection.findFirst({
        where: { 
          companyId: input.companyId,
          noteRef: input.noteRef 
        }
      });

      if (!note) {
        return {
          exists: false,
          selected: false,
          hasContent: false,
          issues: [`Note ${input.noteRef} does not exist for this company`]
        };
      }

      const issues: string[] = [];
      let hasContent = true;

      // Check specific note requirements
      switch (input.noteRef) {
        case 'A.1': // Corporate information
          const commonControl = await db.commonControl.findFirst({
            where: { companyId: input.companyId }
          });
          if (!commonControl || !commonControl.entityName) {
            issues.push('Entity name is required for corporate information note');
            hasContent = false;
          }
          break;

        case 'A.2': // Accounting policies
          const policies = await db.accountingPolicyContent.findMany({
            where: { 
              companyId: input.companyId,
              noteRef: input.noteRef 
            }
          });
          if (policies.length === 0) {
            issues.push('No accounting policy content found');
            hasContent = false;
          }
          break;

        case 'E.3': // Related party disclosures
          const relatedParties = await db.relatedPartyTransaction.findMany({
            where: { companyId: input.companyId }
          });
          if (note.finalSelected && relatedParties.length === 0) {
            issues.push('Note is selected but no related party transactions found');
          }
          break;

        case 'F.8': // Ratio variance explanations
          const ratios = await db.ratioAnalysis.findMany({
            where: { companyId: input.companyId }
          });
          const ratiosNeedingExplanation = ratios.filter(r => Math.abs(Number(r.variancePercentage)) > 25);
          const ratiosWithoutExplanation = ratiosNeedingExplanation.filter(r => !r.explanation);
          
          if (ratiosWithoutExplanation.length > 0) {
            issues.push(`${ratiosWithoutExplanation.length} ratios with >25% variance lack explanations`);
            hasContent = false;
          }
          break;

        case 'F.9': // Aging schedules
          const receivables = await db.receivableLedgerEntry.findMany({
            where: { companyId: input.companyId }
          });
          const payables = await db.payableLedgerEntry.findMany({
            where: { companyId: input.companyId }
          });
          
          if (note.finalSelected && receivables.length === 0 && payables.length === 0) {
            issues.push('Note is selected but no aging data found');
            hasContent = false;
          }
          break;
      }

      return {
        exists: true,
        selected: note.finalSelected,
        hasContent,
        systemRecommended: note.systemRecommended,
        issues
      };

    } catch (error) {
      console.error('Error in validateNoteCompliance:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to validate note compliance: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

export const validateFinancialStatementFormat = baseProcedure
  .input(z.object({
    companyId: z.string(),
    statementType: z.enum(['balance_sheet', 'profit_loss', 'cash_flow'])
  }))
  .query(async ({ input }) => {
    try {
      const trialBalance = await db.trialBalanceEntry.findMany({
        where: { companyId: input.companyId },
        include: {
          majorHead: true,
          grouping: true,
        },
      });

      const issues: string[] = [];
      let formatCompliant = true;

      switch (input.statementType) {
        case 'balance_sheet':
          // Check for required major heads in Balance Sheet
          const requiredBSHeads = [
            'Property, Plant and Equipment',
            'Intangible Assets', 
            'Trade Receivables',
            'Cash and Cash Equivalents',
            'Equity Share Capital',
            'Trade Payables'
          ];

          const bsEntries = trialBalance.filter(entry => entry.type === 'BS');
          
          for (const requiredHead of requiredBSHeads) {
            const hasHead = bsEntries.some(entry => 
              entry.majorHead?.name?.includes(requiredHead)
            );
            if (!hasHead) {
              issues.push(`Missing required major head: ${requiredHead}`);
              formatCompliant = false;
            }
          }

          // Check balance
          const totalAssets = bsEntries
            .filter(entry => entry.majorHead?.name?.includes('Assets'))
            .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);
          
          const totalEquityLiabilities = bsEntries
            .filter(entry => 
              entry.majorHead?.name?.includes('Equity') || 
              entry.majorHead?.name?.includes('Liabilities')
            )
            .reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0);

          if (Math.abs(totalAssets - totalEquityLiabilities) > 1) {
            issues.push('Balance sheet does not balance - Assets ≠ Equity + Liabilities');
            formatCompliant = false;
          }
          break;

        case 'profit_loss':
          // Check for required major heads in P&L
          const requiredPLHeads = [
            'Revenue from Operations',
            'Other Income',
            'Employee Benefits Expense',
            'Finance Costs',
            'Depreciation and Amortization'
          ];

          const plEntries = trialBalance.filter(entry => entry.type === 'PL');
          
          for (const requiredHead of requiredPLHeads) {
            const hasHead = plEntries.some(entry => 
              entry.majorHead?.name?.includes(requiredHead)
            );
            if (!hasHead) {
              issues.push(`Missing recommended major head: ${requiredHead}`);
            }
          }
          break;

        case 'cash_flow':
          // Check if sufficient data exists for cash flow preparation
          const hasDepreciation = trialBalance.some(entry =>
            entry.majorHead?.name?.includes('Depreciation')
          );
          
          if (!hasDepreciation) {
            issues.push('No depreciation data found - required for cash flow statement');
            formatCompliant = false;
          }
          break;
      }

      return {
        formatCompliant,
        issues,
        totalChecks: input.statementType === 'balance_sheet' ? 7 : 
                    input.statementType === 'profit_loss' ? 5 : 1,
        passedChecks: issues.length === 0 ? 
                     (input.statementType === 'balance_sheet' ? 7 : 
                      input.statementType === 'profit_loss' ? 5 : 1) : 
                     (input.statementType === 'balance_sheet' ? 7 - issues.length : 
                      input.statementType === 'profit_loss' ? 5 - issues.length : 
                      issues.length === 0 ? 1 : 0)
      };

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to validate financial statement format: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });
