import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const generateCashFlow = baseProcedure.query(async () => {
  const trialBalance = await db.trialBalanceEntry.findMany({
    include: {
      majorHead: true,
      minorHead: true,
      grouping: true,
    },
  });

  // Helper function to categorize entries based on major head, minor head, and grouping
  const categorizeEntry = (entry: any) => {
    const majorHead = entry.majorHead?.name || '';
    const minorHead = entry.minorHead?.name || '';
    const grouping = entry.grouping?.name || '';
    
    // Operating activities - more granular categorization
    if (majorHead.includes('Revenue') || majorHead.includes('Income')) {
      return 'revenue';
    }
    if (majorHead.includes('Expense') || majorHead.includes('Cost')) {
      return 'expense';
    }
    if (majorHead.includes('Depreciation') || minorHead.includes('Depreciation')) {
      return 'depreciation';
    }
    
    // Working capital items - consider minor head and grouping for better classification
    if (majorHead.includes('Trade Receivables') || 
        (minorHead.includes('Receivables') && !minorHead.includes('Non-current'))) {
      return 'receivables';
    }
    if (majorHead.includes('Trade Payables') || 
        (minorHead.includes('Payables') && !minorHead.includes('Non-current'))) {
      return 'payables';
    }
    if (majorHead.includes('Inventories') || minorHead.includes('Inventory')) {
      return 'inventory';
    }
    
    // Investing activities - enhanced with minor head classification
    if (majorHead.includes('Property, Plant and Equipment') || 
        minorHead.includes('PPE') || minorHead.includes('Fixed Assets')) {
      return 'ppe';
    }
    if (majorHead.includes('Investments') && 
        (minorHead.includes('Non-current') || grouping.includes('Long-term'))) {
      return 'investments';
    }
    if (majorHead.includes('Capital Work') || minorHead.includes('CWIP')) {
      return 'cwip';
    }
    
    // Financing activities - consider grouping for better classification
    if (majorHead.includes('Borrowings') || minorHead.includes('Loans')) {
      if (grouping.includes('Long-term') || grouping.includes('Non-current')) {
        return 'long_term_borrowings';
      } else {
        return 'short_term_borrowings';
      }
    }
    if (majorHead.includes('Share Capital') || majorHead.includes('Equity')) {
      return 'equity';
    }
    
    // Cash and cash equivalents
    if (majorHead.includes('Cash') || minorHead.includes('Cash') || minorHead.includes('Bank')) {
      return 'cash';
    }
    
    return 'other';
  };

  // Categorize all entries
  const categorizedEntries = trialBalance.map(entry => ({
    ...entry,
    category: categorizeEntry(entry)
  }));

  // Calculate net profit from P&L items for both years
  const plEntries = categorizedEntries.filter(entry => entry.type === 'PL');
  const revenueEntries = plEntries.filter(entry => entry.category === 'revenue');
  const expenseEntries = plEntries.filter(entry => entry.category === 'expense');

  const totalRevenueCY = revenueEntries.reduce((sum, item) => sum + Math.abs(Number(item.closingBalanceCY)), 0);
  const totalExpensesCY = expenseEntries.reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);
  const netProfitCY = totalRevenueCY - totalExpensesCY;

  const totalRevenuePY = revenueEntries.reduce((sum, item) => sum + Math.abs(Number(item.closingBalancePY)), 0);
  const totalExpensesPY = expenseEntries.reduce((sum, item) => sum + Number(item.closingBalancePY), 0);
  const netProfitPY = totalRevenuePY - totalExpensesPY;

  // Operating activities adjustments - using categorized entries
  const depreciationCY = categorizedEntries
    .filter(entry => entry.category === 'depreciation')
    .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);

  const depreciationPY = categorizedEntries
    .filter(entry => entry.category === 'depreciation')
    .reduce((sum, item) => sum + Number(item.closingBalancePY), 0);

  // Working capital changes - using enhanced categorization
  const receivablesChangeCY = categorizedEntries
    .filter(entry => entry.category === 'receivables')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const payablesChangeCY = categorizedEntries
    .filter(entry => entry.category === 'payables')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const inventoryChangeCY = categorizedEntries
    .filter(entry => entry.category === 'inventory')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  // For previous year calculations (simplified approach as before)
  const receivablesChangePY = 0;
  const payablesChangePY = 0;
  const inventoryChangePY = 0;

  const operatingCashFlowCY = netProfitCY + depreciationCY - receivablesChangeCY + payablesChangeCY - inventoryChangeCY;
  const operatingCashFlowPY = netProfitPY + depreciationPY - receivablesChangePY + payablesChangePY - inventoryChangePY;

  // Investing activities - enhanced with minor head and grouping consideration
  const ppeChangeCY = categorizedEntries
    .filter(entry => entry.category === 'ppe')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const investmentChangeCY = categorizedEntries
    .filter(entry => entry.category === 'investments')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const cwipChangeCY = categorizedEntries
    .filter(entry => entry.category === 'cwip')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const ppeChangePY = 0;
  const investmentChangePY = 0;
  const cwipChangePY = 0;

  const investingCashFlowCY = -ppeChangeCY - investmentChangeCY - cwipChangeCY;
  const investingCashFlowPY = -ppeChangePY - investmentChangePY - cwipChangePY;

  // Financing activities - differentiate between long-term and short-term
  const longTermBorrowingsChangeCY = categorizedEntries
    .filter(entry => entry.category === 'long_term_borrowings')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const shortTermBorrowingsChangeCY = categorizedEntries
    .filter(entry => entry.category === 'short_term_borrowings')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const equityChangeCY = categorizedEntries
    .filter(entry => entry.category === 'equity')
    .reduce((sum, item) => sum + (Number(item.closingBalanceCY) - Number(item.closingBalancePY)), 0);

  const longTermBorrowingsChangePY = 0;
  const shortTermBorrowingsChangePY = 0;
  const equityChangePY = 0;

  const financingCashFlowCY = longTermBorrowingsChangeCY + shortTermBorrowingsChangeCY + equityChangeCY;
  const financingCashFlowPY = longTermBorrowingsChangePY + shortTermBorrowingsChangePY + equityChangePY;

  // Net cash flow
  const netCashFlowCY = operatingCashFlowCY + investingCashFlowCY + financingCashFlowCY;
  const netCashFlowPY = operatingCashFlowPY + investingCashFlowPY + financingCashFlowPY;

  // Cash balances - using enhanced categorization
  const openingCash = categorizedEntries
    .filter(entry => entry.category === 'cash')
    .reduce((sum, item) => sum + Number(item.closingBalancePY), 0);

  const closingCash = categorizedEntries
    .filter(entry => entry.category === 'cash')
    .reduce((sum, item) => sum + Number(item.closingBalanceCY), 0);

  return {
    operatingActivities: {
      netProfit: netProfitCY,
      netProfitPY: netProfitPY,
      depreciation: depreciationCY,
      depreciationPY: depreciationPY,
      receivablesChange: -receivablesChangeCY,
      receivablesChangePY: -receivablesChangePY,
      payablesChange: payablesChangeCY,
      payablesChangePY: payablesChangePY,
      inventoryChange: -inventoryChangeCY,
      inventoryChangePY: -inventoryChangePY,
      total: operatingCashFlowCY,
      totalPY: operatingCashFlowPY,
    },
    investingActivities: {
      ppeAdditions: -ppeChangeCY,
      ppeAdditionsPY: -ppeChangePY,
      investmentChange: -investmentChangeCY,
      investmentChangePY: -investmentChangePY,
      cwipChange: -cwipChangeCY,
      cwipChangePY: -cwipChangePY,
      total: investingCashFlowCY,
      totalPY: investingCashFlowPY,
    },
    financingActivities: {
      longTermBorrowingsChange: longTermBorrowingsChangeCY,
      longTermBorrowingsChangePY: longTermBorrowingsChangePY,
      shortTermBorrowingsChange: shortTermBorrowingsChangeCY,
      shortTermBorrowingsChangePY: shortTermBorrowingsChangePY,
      equityChange: equityChangeCY,
      equityChangePY: equityChangePY,
      total: financingCashFlowCY,
      totalPY: financingCashFlowPY,
    },
    netCashFlow: netCashFlowCY,
    netCashFlowPY: netCashFlowPY,
    openingCash,
    closingCash,
    // Enhanced breakdown with categorization details
    breakdown: {
      categorization: {
        totalEntries: categorizedEntries.length,
        categories: {
          revenue: categorizedEntries.filter(e => e.category === 'revenue').length,
          expense: categorizedEntries.filter(e => e.category === 'expense').length,
          depreciation: categorizedEntries.filter(e => e.category === 'depreciation').length,
          receivables: categorizedEntries.filter(e => e.category === 'receivables').length,
          payables: categorizedEntries.filter(e => e.category === 'payables').length,
          inventory: categorizedEntries.filter(e => e.category === 'inventory').length,
          ppe: categorizedEntries.filter(e => e.category === 'ppe').length,
          investments: categorizedEntries.filter(e => e.category === 'investments').length,
          cwip: categorizedEntries.filter(e => e.category === 'cwip').length,
          longTermBorrowings: categorizedEntries.filter(e => e.category === 'long_term_borrowings').length,
          shortTermBorrowings: categorizedEntries.filter(e => e.category === 'short_term_borrowings').length,
          equity: categorizedEntries.filter(e => e.category === 'equity').length,
          cash: categorizedEntries.filter(e => e.category === 'cash').length,
          other: categorizedEntries.filter(e => e.category === 'other').length,
        }
      },
      operatingDetails: {
        profitBeforeTax: { current: netProfitCY, previous: netProfitPY },
        depreciation: { current: depreciationCY, previous: depreciationPY },
        workingCapitalChanges: {
          receivables: { current: -receivablesChangeCY, previous: -receivablesChangePY },
          payables: { current: payablesChangeCY, previous: payablesChangePY },
          inventory: { current: -inventoryChangeCY, previous: -inventoryChangePY },
        }
      },
      investingDetails: {
        ppeInvestments: { current: -ppeChangeCY, previous: -ppeChangePY },
        otherInvestments: { current: -investmentChangeCY, previous: -investmentChangePY },
        cwipInvestments: { current: -cwipChangeCY, previous: -cwipChangePY },
      },
      financingDetails: {
        longTermBorrowings: { current: longTermBorrowingsChangeCY, previous: longTermBorrowingsChangePY },
        shortTermBorrowings: { current: shortTermBorrowingsChangeCY, previous: shortTermBorrowingsChangePY },
        equity: { current: equityChangeCY, previous: equityChangePY },
      }
    }
  };
});
