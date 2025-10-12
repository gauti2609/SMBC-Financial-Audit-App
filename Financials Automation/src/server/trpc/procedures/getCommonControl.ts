import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getCommonControl = baseProcedure
  .input(z.object({
    companyId: z.string(),
  }))
  .query(async ({ input }) => {
    // Try to get existing common control settings for the specific company
    const commonControl = await db.commonControl.findFirst({
      where: { companyId: input.companyId },
      orderBy: { createdAt: 'desc' },
    });

    if (!commonControl) {
      // Return default values if no settings exist for this company
      return {
        companyId: input.companyId,
        entityName: '',
        address: '',
        cinNumber: null,
        financialYearStart: new Date('2024-04-01'),
        financialYearEnd: new Date('2025-03-31'),
        currency: 'INR',
        units: 'Millions',
        numbersFormat: 'Accounting',
        negativeColor: 'Brackets',
        defaultFont: 'Bookman Old Style',
        defaultFontSize: 11,
        
        // Comparison Settings
        showVarianceAnalysis: true,
        showGrowthRates: true,
        showTrendIndicators: true,
        varianceThreshold: 25,
        comparisonLayout: 'Detailed',
        
        // Report Customization
        includeComplianceIndicators: true,
        showNoteNumbers: true,
        includeSummaryStats: true,
        reportHeaderStyle: 'Standard',
        pageOrientation: 'Portrait',
        includeSignatureSection: true,
        
        // Advanced Settings
        roundingPrecision: 2,
        zeroDisplayMode: 'Dash',
        includeComparativeAnalysis: true,
        autoGenerateExplanations: true,
      };
    }

    return {
      ...commonControl,
      // Ensure boolean fields are properly typed
      showVarianceAnalysis: commonControl.showVarianceAnalysis ?? true,
      showGrowthRates: commonControl.showGrowthRates ?? true,
      showTrendIndicators: commonControl.showTrendIndicators ?? true,
      includeComplianceIndicators: commonControl.includeComplianceIndicators ?? true,
      showNoteNumbers: commonControl.showNoteNumbers ?? true,
      includeSummaryStats: commonControl.includeSummaryStats ?? true,
      includeSignatureSection: commonControl.includeSignatureSection ?? true,
      includeComparativeAnalysis: commonControl.includeComparativeAnalysis ?? true,
      autoGenerateExplanations: commonControl.autoGenerateExplanations ?? true,
      
      // Ensure numeric fields have defaults
      varianceThreshold: commonControl.varianceThreshold ?? 25,
      defaultFontSize: commonControl.defaultFontSize ?? 11,
      roundingPrecision: commonControl.roundingPrecision ?? 2,
      
      // Ensure string fields have defaults
      comparisonLayout: commonControl.comparisonLayout ?? 'Detailed',
      reportHeaderStyle: commonControl.reportHeaderStyle ?? 'Standard',
      pageOrientation: commonControl.pageOrientation ?? 'Portrait',
      zeroDisplayMode: commonControl.zeroDisplayMode ?? 'Dash',
    };
  });
