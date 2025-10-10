import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const generateRatioAnalysis = baseProcedure.query(async () => {
  const trialBalance = await db.trialBalanceEntry.findMany({
    include: {
      majorHead: true,
      grouping: true,
    },
  });

  // Helper function to get total for specific major heads
  const getTotalByCriteria = (criteria: string[], year: 'CY' | 'PY') => {
    return trialBalance
      .filter(entry => criteria.some(criterion => entry.majorHead?.name?.includes(criterion)))
      .reduce((sum, item) => sum + Math.abs(Number(year === 'CY' ? item.closingBalanceCY : item.closingBalancePY)), 0);
  };

  // Balance Sheet items
  const totalAssetsCY = getTotalByCriteria(['Assets', 'Receivables', 'Cash', 'Inventories', 'Investments'], 'CY');
  const totalAssetsPY = getTotalByCriteria(['Assets', 'Receivables', 'Cash', 'Inventories', 'Investments'], 'PY');
  
  const currentAssetsCY = getTotalByCriteria(['Trade Receivables', 'Cash', 'Inventories'], 'CY');
  const currentAssetsPY = getTotalByCriteria(['Trade Receivables', 'Cash', 'Inventories'], 'PY');
  
  const currentLiabilitiesCY = getTotalByCriteria(['Trade Payables', 'Current Liabilities'], 'CY');
  const currentLiabilitiesPY = getTotalByCriteria(['Trade Payables', 'Current Liabilities'], 'PY');
  
  const totalEquityCY = getTotalByCriteria(['Equity', 'Share Capital'], 'CY');
  const totalEquityPY = getTotalByCriteria(['Equity', 'Share Capital'], 'PY');
  
  const totalDebtCY = getTotalByCriteria(['Borrowings', 'Loans'], 'CY');
  const totalDebtPY = getTotalByCriteria(['Borrowings', 'Loans'], 'PY');

  // P&L items
  const revenueCY = getTotalByCriteria(['Revenue', 'Income'], 'CY');
  const revenuePY = getTotalByCriteria(['Revenue', 'Income'], 'PY');
  
  const netProfitCY = revenueCY - getTotalByCriteria(['Expense', 'Cost', 'Finance Costs'], 'CY');
  const netProfitPY = revenuePY - getTotalByCriteria(['Expense', 'Cost', 'Finance Costs'], 'PY');

  // Calculate ratios
  const ratios = [
    {
      name: 'Current Ratio',
      formula: 'Current Assets / Current Liabilities',
      currentYear: currentLiabilitiesCY !== 0 ? currentAssetsCY / currentLiabilitiesCY : 0,
      previousYear: currentLiabilitiesPY !== 0 ? currentAssetsPY / currentLiabilitiesPY : 0,
    },
    {
      name: 'Debt to Equity Ratio',
      formula: 'Total Debt / Total Equity',
      currentYear: totalEquityCY !== 0 ? totalDebtCY / totalEquityCY : 0,
      previousYear: totalEquityPY !== 0 ? totalDebtPY / totalEquityPY : 0,
    },
    {
      name: 'Return on Assets (%)',
      formula: '(Net Profit / Total Assets) * 100',
      currentYear: totalAssetsCY !== 0 ? (netProfitCY / totalAssetsCY) * 100 : 0,
      previousYear: totalAssetsPY !== 0 ? (netProfitPY / totalAssetsPY) * 100 : 0,
    },
    {
      name: 'Return on Equity (%)',
      formula: '(Net Profit / Total Equity) * 100',
      currentYear: totalEquityCY !== 0 ? (netProfitCY / totalEquityCY) * 100 : 0,
      previousYear: totalEquityPY !== 0 ? (netProfitPY / totalEquityPY) * 100 : 0,
    },
    {
      name: 'Asset Turnover Ratio',
      formula: 'Revenue / Total Assets',
      currentYear: totalAssetsCY !== 0 ? revenueCY / totalAssetsCY : 0,
      previousYear: totalAssetsPY !== 0 ? revenuePY / totalAssetsPY : 0,
    },
  ];

  // Calculate variance and explanations
  const ratiosWithVariance = ratios.map(ratio => {
    const variance = ratio.previousYear !== 0 
      ? ((ratio.currentYear - ratio.previousYear) / Math.abs(ratio.previousYear)) * 100 
      : 0;
    
    let explanation = '';
    if (Math.abs(variance) > 25) {
      if (variance > 0) {
        explanation = `Improvement of ${Math.abs(variance).toFixed(1)}% due to better operational performance.`;
      } else {
        explanation = `Decline of ${Math.abs(variance).toFixed(1)}% requires management attention.`;
      }
    } else {
      explanation = 'Ratio remains relatively stable compared to previous year.';
    }

    return {
      ...ratio,
      variance: variance,
      explanation,
      requiresExplanation: Math.abs(variance) > 25,
    };
  });

  return {
    ratios: ratiosWithVariance,
    summary: {
      totalRatios: ratiosWithVariance.length,
      ratiosRequiringExplanation: ratiosWithVariance.filter(r => r.requiresExplanation).length,
      averageVariance: ratiosWithVariance.reduce((sum, r) => sum + Math.abs(r.variance), 0) / ratiosWithVariance.length,
    },
  };
});
