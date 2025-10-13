/**
 * Seed script to populate Major Heads, Minor Heads, and Groupings
 * Based on VBA_Module1.bas standard lists for Schedule III compliance
 */

import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

// Master list of Major Heads with classification from VBA
const majorHeadsData = [
  // BALANCE SHEET - ASSETS
  { name: "Property, Plant and Equipment", statementType: "BS", category: "Asset" },
  { name: "Intangible Assets", statementType: "BS", category: "Asset" },
  { name: "Non-current Investments", statementType: "BS", category: "Asset" },
  { name: "Long-term Loans and Advances", statementType: "BS", category: "Asset" },
  { name: "Other Non-current Assets", statementType: "BS", category: "Asset" },
  { name: "Current Investments", statementType: "BS", category: "Asset" },
  { name: "Inventories", statementType: "BS", category: "Asset" },
  { name: "Trade Receivables", statementType: "BS", category: "Asset" },
  { name: "Cash and Cash Equivalents", statementType: "BS", category: "Asset" },
  { name: "Short-term Loans and Advances", statementType: "BS", category: "Asset" },
  { name: "Other Current Assets", statementType: "BS", category: "Asset" },
  
  // BALANCE SHEET - EQUITY
  { name: "Equity Share Capital", statementType: "BS", category: "Liability" },
  { name: "Other Equity", statementType: "BS", category: "Liability" },
  
  // BALANCE SHEET - LIABILITIES
  { name: "Long-term Borrowings", statementType: "BS", category: "Liability" },
  { name: "Deferred Tax Liabilities (Net)", statementType: "BS", category: "Liability" },
  { name: "Other Long-term Liabilities", statementType: "BS", category: "Liability" },
  { name: "Long-term Provisions", statementType: "BS", category: "Liability" },
  { name: "Short-term Borrowings", statementType: "BS", category: "Liability" },
  { name: "Trade Payables", statementType: "BS", category: "Liability" },
  { name: "Other Current Liabilities", statementType: "BS", category: "Liability" },
  { name: "Short-term Provisions", statementType: "BS", category: "Liability" },
  
  // PROFIT & LOSS - INCOME
  { name: "Revenue from Operations", statementType: "PL", category: "Income" },
  { name: "Other Income", statementType: "PL", category: "Income" },
  
  // PROFIT & LOSS - EXPENSES
  { name: "Cost of Materials Consumed", statementType: "PL", category: "Expense" },
  { name: "Purchases of Stock-in-Trade", statementType: "PL", category: "Expense" },
  { name: "Changes in Inventories", statementType: "PL", category: "Expense" },
  { name: "Employee Benefits Expense", statementType: "PL", category: "Expense" },
  { name: "Finance Costs", statementType: "PL", category: "Expense" },
  { name: "Depreciation and Amortization", statementType: "PL", category: "Expense" },
  { name: "Other Expenses", statementType: "PL", category: "Expense" },
  { name: "Exceptional Items", statementType: "PL", category: "Expense" },
  { name: "Extraordinary Items", statementType: "PL", category: "Expense" },
  { name: "Taxes on Income", statementType: "PL", category: "Expense" },
  { name: "Prior Period Items", statementType: "PL", category: "Expense" },
];

// Minor Heads mapped to Major Heads from VBA
const minorHeadsData = [
  // Property, Plant and Equipment
  { name: "Tangible Assets", majorHeadName: "Property, Plant and Equipment" },
  
  // Intangible Assets
  { name: "Intangible Assets", majorHeadName: "Intangible Assets" },
  
  // Non-current Investments
  { name: "Financial Assets - Investments", majorHeadName: "Non-current Investments" },
  
  // Long-term Loans and Advances
  { name: "Financial Assets - Loans", majorHeadName: "Long-term Loans and Advances" },
  
  // Other Non-current Assets
  { name: "Other Non-current Assets", majorHeadName: "Other Non-current Assets" },
  
  // Inventories
  { name: "Inventories", majorHeadName: "Inventories" },
  
  // Trade Receivables
  { name: "Financial Assets - Trade Receivables", majorHeadName: "Trade Receivables" },
  
  // Cash and Cash Equivalents
  { name: "Cash and Cash Equivalents", majorHeadName: "Cash and Cash Equivalents" },
  
  // Short-term Loans and Advances
  { name: "Financial Assets - Loans", majorHeadName: "Short-term Loans and Advances" },
  { name: "Other financial assets", majorHeadName: "Short-term Loans and Advances" },
  
  // Equity Share Capital
  { name: "Equity Share Capital", majorHeadName: "Equity Share Capital" },
  
  // Other Equity
  { name: "Other Equity", majorHeadName: "Other Equity" },
  
  // Long-term Borrowings
  { name: "Financial Liabilities - Borrowings", majorHeadName: "Long-term Borrowings" },
  
  // Long-term Provisions
  { name: "Provisions", majorHeadName: "Long-term Provisions" },
  { name: "Other financial liabilities", majorHeadName: "Long-term Provisions" },
  
  // Short-term Borrowings
  { name: "Financial Liabilities - Borrowings", majorHeadName: "Short-term Borrowings" },
  
  // Trade Payables
  { name: "Financial Liabilities - Trade Payables", majorHeadName: "Trade Payables" },
  
  // Other Current Liabilities
  { name: "Other financial liabilities", majorHeadName: "Other Current Liabilities" },
  
  // Short-term Provisions
  { name: "Provisions", majorHeadName: "Short-term Provisions" },
  
  // Revenue from Operations
  { name: "Revenue from Operations", majorHeadName: "Revenue from Operations" },
  
  // Other Income
  { name: "Other Income", majorHeadName: "Other Income" },
  
  // Cost of Materials Consumed
  { name: "Cost of Materials Consumed", majorHeadName: "Cost of Materials Consumed" },
  
  // Purchases of Stock-in-Trade
  { name: "Purchases of Stock-in-Trade", majorHeadName: "Purchases of Stock-in-Trade" },
  
  // Changes in Inventories
  { name: "Changes in inventories of finished goods, work-in-progress and Stock-in-Trade", majorHeadName: "Changes in Inventories" },
  
  // Employee Benefits Expense
  { name: "Employee Benefit Expense", majorHeadName: "Employee Benefits Expense" },
  
  // Finance Costs
  { name: "Finance Costs", majorHeadName: "Finance Costs" },
  
  // Depreciation and Amortization
  { name: "Depreciation and Amortization Expense", majorHeadName: "Depreciation and Amortization" },
  
  // Other Expenses
  { name: "Other Expenses", majorHeadName: "Other Expenses" },
];

// Groupings mapped to Minor Heads from VBA (70+ groupings)
const groupingsData = [
  // Tangible Assets (PPE)
  { name: "Land", minorHeadName: "Tangible Assets" },
  { name: "Building", minorHeadName: "Tangible Assets" },
  { name: "Plant and Machinery", minorHeadName: "Tangible Assets" },
  { name: "Furniture and Fixtures", minorHeadName: "Tangible Assets" },
  { name: "Vehicles", minorHeadName: "Tangible Assets" },
  { name: "Office Equipment", minorHeadName: "Tangible Assets" },
  { name: "Capital Work-in-Progress", minorHeadName: "Tangible Assets" },
  
  // Intangible Assets
  { name: "Goodwill", minorHeadName: "Intangible Assets" },
  { name: "Patents, Copyrights, Trademarks", minorHeadName: "Intangible Assets" },
  { name: "Intangible assets under development", minorHeadName: "Intangible Assets" },
  
  // Financial Assets - Investments (Non-current)
  { name: "Financial Investments - Mutual funds", minorHeadName: "Financial Assets - Investments" },
  { name: "Financial Investments - Equity instruments", minorHeadName: "Financial Assets - Investments" },
  { name: "Financial Investments - Others", minorHeadName: "Financial Assets - Investments" },
  
  // Financial Assets - Loans (Long-term)
  { name: "Loans to related parties", minorHeadName: "Financial Assets - Loans" },
  { name: "Loans to others", minorHeadName: "Financial Assets - Loans" },
  
  // Other Non-current Assets
  { name: "Other non-current assets", minorHeadName: "Other Non-current Assets" },
  
  // Inventories
  { name: "Raw materials", minorHeadName: "Inventories" },
  { name: "Work-in-progress", minorHeadName: "Inventories" },
  { name: "Finished goods", minorHeadName: "Inventories" },
  { name: "Stock-in-trade", minorHeadName: "Inventories" },
  { name: "Stores and spares", minorHeadName: "Inventories" },
  { name: "Loose tools", minorHeadName: "Inventories" },
  
  // Financial Assets - Trade Receivables
  { name: "Trade receivables outstanding > 6 months", minorHeadName: "Financial Assets - Trade Receivables" },
  { name: "Trade receivables outstanding < 6 months", minorHeadName: "Financial Assets - Trade Receivables" },
  
  // Cash and Cash Equivalents
  { name: "Balances with banks", minorHeadName: "Cash and Cash Equivalents" },
  { name: "Cheques, drafts on hand", minorHeadName: "Cash and Cash Equivalents" },
  { name: "Cash on hand", minorHeadName: "Cash and Cash Equivalents" },
  { name: "Other bank balances", minorHeadName: "Cash and Cash Equivalents" },
  
  // Financial Assets - Loans (Short-term) - using first occurrence
  { name: "Security deposits", minorHeadName: "Financial Assets - Loans" },
  
  // Other financial assets (Short-term)
  { name: "Other current assets", minorHeadName: "Other financial assets" },
  
  // Other Equity
  { name: "Retained Earnings", minorHeadName: "Other Equity" },
  { name: "General Reserve", minorHeadName: "Other Equity" },
  { name: "Securities Premium", minorHeadName: "Other Equity" },
  
  // Financial Liabilities - Borrowings (Long-term) - first occurrence
  { name: "Debentures/Bonds", minorHeadName: "Financial Liabilities - Borrowings" },
  { name: "Term Loans from Banks", minorHeadName: "Financial Liabilities - Borrowings" },
  { name: "Term Loans from others", minorHeadName: "Financial Liabilities - Borrowings" },
  
  // Provisions (Long-term) - first occurrence
  { name: "Deferred tax liability", minorHeadName: "Provisions" },
  { name: "Provision for employee benefits", minorHeadName: "Provisions" },
  { name: "Other provisions", minorHeadName: "Provisions" },
  
  // Financial Liabilities - Borrowings (Short-term) - need to map to second occurrence
  { name: "Borrowings from Banks", minorHeadName: "Financial Liabilities - Borrowings" },
  { name: "Borrowings from others", minorHeadName: "Financial Liabilities - Borrowings" },
  
  // Financial Liabilities - Trade Payables
  { name: "Trade Payables - MSMEs", minorHeadName: "Financial Liabilities - Trade Payables" },
  { name: "Trade Payables - Others", minorHeadName: "Financial Liabilities - Trade Payables" },
  
  // Other financial liabilities (Current) - second occurrence
  { name: "Current maturities of long-term debt", minorHeadName: "Other financial liabilities" },
  { name: "Interest accrued", minorHeadName: "Other financial liabilities" },
  { name: "Unpaid dividends", minorHeadName: "Other financial liabilities" },
  { name: "Other payables", minorHeadName: "Other financial liabilities" },
  
  // Provisions (Short-term) - second occurrence
  { name: "Provision for tax", minorHeadName: "Provisions" },
  
  // Revenue from Operations
  { name: "Sale of products", minorHeadName: "Revenue from Operations" },
  { name: "Sale of services", minorHeadName: "Revenue from Operations" },
  { name: "Other operating revenues", minorHeadName: "Revenue from Operations" },
  
  // Other Income
  { name: "Interest Income", minorHeadName: "Other Income" },
  { name: "Dividend Income", minorHeadName: "Other Income" },
  { name: "Net gain/loss on sale of investments", minorHeadName: "Other Income" },
  { name: "Other non-operating income", minorHeadName: "Other Income" },
  
  // Cost of Materials Consumed
  { name: "Raw material consumed", minorHeadName: "Cost of Materials Consumed" },
  
  // Purchases of Stock-in-Trade
  { name: "Purchase of stock-in-trade", minorHeadName: "Purchases of Stock-in-Trade" },
  
  // Employee Benefit Expense
  { name: "Salaries and wages", minorHeadName: "Employee Benefit Expense" },
  { name: "Contribution to provident and other funds", minorHeadName: "Employee Benefit Expense" },
  { name: "Staff welfare expenses", minorHeadName: "Employee Benefit Expense" },
  
  // Finance Costs
  { name: "Interest expense", minorHeadName: "Finance Costs" },
  { name: "Other borrowing costs", minorHeadName: "Finance Costs" },
  
  // Depreciation and Amortization Expense
  { name: "Depreciation on tangible assets", minorHeadName: "Depreciation and Amortization Expense" },
  { name: "Amortization on intangible assets", minorHeadName: "Depreciation and Amortization Expense" },
  
  // Other Expenses
  { name: "Rent", minorHeadName: "Other Expenses" },
  { name: "Rates and taxes", minorHeadName: "Other Expenses" },
  { name: "Power and fuel", minorHeadName: "Other Expenses" },
  { name: "Repairs to buildings", minorHeadName: "Other Expenses" },
  { name: "Repairs to machinery", minorHeadName: "Other Expenses" },
  { name: "Insurance", minorHeadName: "Other Expenses" },
  { name: "Auditor's remuneration", minorHeadName: "Other Expenses" },
  { name: "Legal and professional fees", minorHeadName: "Other Expenses" },
  { name: "Corporate Social Responsibility (CSR) expense", minorHeadName: "Other Expenses" },
  { name: "Miscellaneous expenses", minorHeadName: "Other Expenses" },
];

async function seed() {
  console.log('🌱 Starting seed: Master Lists from VBA...');

  try {
    // Clear existing data (in reverse order due to foreign keys)
    console.log('Clearing existing data...');
    await prisma.grouping.deleteMany({});
    await prisma.minorHead.deleteMany({});
    await prisma.majorHead.deleteMany({});

    // Seed Major Heads
    console.log('Seeding Major Heads...');
    const majorHeads = await Promise.all(
      majorHeadsData.map(data =>
        prisma.majorHead.create({ data })
      )
    );
    console.log(`✅ Created ${majorHeads.length} Major Heads`);

    // Seed Minor Heads (need to look up majorHeadId)
    console.log('Seeding Minor Heads...');
    const minorHeads = await Promise.all(
      minorHeadsData.map(async (data) => {
        const majorHead = await prisma.majorHead.findUnique({
          where: { name: data.majorHeadName }
        });
        if (!majorHead) {
          console.error(`❌ Major Head not found: ${data.majorHeadName}`);
          return null;
        }
        return prisma.minorHead.create({
          data: {
            name: data.name,
            majorHeadId: majorHead.id
          }
        });
      })
    );
    const validMinorHeads = minorHeads.filter(Boolean);
    console.log(`✅ Created ${validMinorHeads.length} Minor Heads`);

    // Seed Groupings (need to look up minorHeadId)
    console.log('Seeding Groupings...');
    const groupings = await Promise.all(
      groupingsData.map(async (data) => {
        const minorHead = await prisma.minorHead.findFirst({
          where: { name: data.minorHeadName }
        });
        if (!minorHead) {
          console.error(`❌ Minor Head not found: ${data.minorHeadName}`);
          return null;
        }
        return prisma.grouping.create({
          data: {
            name: data.name,
            minorHeadId: minorHead.id
          }
        });
      })
    );
    const validGroupings = groupings.filter(Boolean);
    console.log(`✅ Created ${validGroupings.length} Groupings`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`   Major Heads: ${majorHeads.length}`);
    console.log(`   Minor Heads: ${validMinorHeads.length}`);
    console.log(`   Groupings: ${validGroupings.length}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
