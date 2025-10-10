import { db, ensureDatabaseConnection } from "../db";
import { minioClient } from "../minio";

async function setup() {
  console.log("Starting database setup...");

  // Ensure database connection is established before proceeding
  console.log("Verifying database connection...");
  try {
    await ensureDatabaseConnection(5); // Try up to 5 times
    console.log("Database connection verified successfully.");
  } catch (error) {
    console.error("Failed to establish database connection:", error);
    throw error;
  }

  // Seed Major Heads
  const majorHeads = [
    "Property, Plant and Equipment", "Intangible Assets", "Non-current Investments",
    "Long-term Loans and Advances", "Other Non-current Assets", "Current Investments",
    "Inventories", "Trade Receivables", "Cash and Cash Equivalents",
    "Short-term Loans and Advances", "Other Current Assets", "Equity Share Capital",
    "Other Equity", "Long-term Borrowings", "Deferred Tax Liabilities (Net)",
    "Other Long-term Liabilities", "Long-term Provisions", "Short-term Borrowings",
    "Trade Payables", "Other Current Liabilities", "Short-term Provisions",
    "Revenue from Operations", "Other Income", "Cost of Materials Consumed",
    "Purchases of Stock-in-Trade", "Changes in Inventories", "Employee Benefits Expense",
    "Finance Costs", "Depreciation and Amortization", "Other Expenses",
    "Exceptional Items", "Extraordinary Items", "Taxes on Income", "Prior Period Items"
  ];

  for (const name of majorHeads) {
    await db.majorHead.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  console.log("Major Heads seeded successfully.");

  // Seed Groupings
  const groupings = [
    "Land", "Building", "Plant and Machinery", "Furniture and Fixtures", "Vehicles",
    "Office Equipment", "Capital Work-in-Progress", "Goodwill", "Patents, Copyrights, Trademarks",
    "Intangible assets under development", "Financial Investments - Mutual funds",
    "Financial Investments - Equity instruments", "Financial Investments - Others",
    "Loans to related parties", "Loans to others", "Other non-current assets",
    "Raw materials", "Work-in-progress", "Finished goods", "Stock-in-trade",
    "Stores and spares", "Loose tools", "Trade receivables outstanding > 6 months",
    "Trade receivables outstanding < 6 months", "Balances with banks",
    "Cheques, drafts on hand", "Cash on hand", "Other bank balances",
    "Security deposits", "Other current assets", "Retained Earnings", "General Reserve",
    "Securities Premium", "Debentures/Bonds", "Term Loans from Banks", "Term Loans from others",
    "Deferred tax liability", "Provision for employee benefits", "Other provisions",
    "Borrowings from Banks", "Borrowings from others", "Trade Payables - MSMEs",
    "Trade Payables - Others", "Current maturities of long-term debt", "Interest accrued",
    "Unpaid dividends", "Other payables", "Provision for tax", "Sale of products",
    "Sale of services", "Other operating revenues", "Interest Income", "Dividend Income",
    "Net gain/loss on sale of investments", "Other non-operating income",
    "Raw material consumed", "Purchase of stock-in-trade", "Salaries and wages",
    "Contribution to provident and other funds", "Staff welfare expenses", "Interest expense",
    "Other borrowing costs", "Depreciation on tangible assets", "Amortization on intangible assets",
    "Rent", "Rates and taxes", "Power and fuel", "Repairs to buildings", "Repairs to machinery",
    "Insurance", "Auditor's remuneration", "Legal and professional fees",
    "Corporate Social Responsibility (CSR) expense", "Miscellaneous expenses"
  ];

  for (const name of groupings) {
    await db.grouping.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
  console.log("Groupings seeded successfully.");

  // Seed Note Selections
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

  for (const note of defaultNotes) {
    // Check if the note already exists
    const existingNote = await db.noteSelection.findFirst({
      where: {
        companyId: null,
        noteRef: note.noteRef
      }
    });

    // If it doesn't exist, create it
    if (!existingNote) {
      await db.noteSelection.create({
        data: {
          companyId: null,
          noteRef: note.noteRef,
          description: note.description,
          linkedMajorHead: note.linkedMajorHead,
          systemRecommended: true,
          userSelected: false,
          finalSelected: false,
        }
      });
    }
  }
  console.log("Default Note Selections seeded successfully.");

  // Create sample license for testing
  console.log("Creating sample license for testing...");
  
  const sampleLicenseKey = "TEST-LICENSE-2024-DEMO-KEY";
  
  const existingLicense = await db.license.findUnique({
    where: { licenseKey: sampleLicenseKey }
  });
  
  if (!existingLicense) {
    await db.license.create({
      data: {
        licenseKey: sampleLicenseKey,
        companyName: "Demo Company Ltd.",
        contactEmail: "admin@democompany.com",
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: true,
        maxUsers: 10,
        maxCompanies: 5,
        networkPath: "postgresql://postgres:postgres@localhost:5432/app",
        allowedIPs: [], // No IP restrictions for demo
        features: {
          "financial_statements": true,
          "compliance_dashboard": true,
          "ratio_analysis": true,
          "aging_schedules": true,
          "export_functionality": true
        },
        activeUsers: 0,
        activeCompanies: 0,
      }
    });
    console.log(`Sample license created: ${sampleLicenseKey}`);
    console.log("Use this license key to test the license management functionality.");
  } else {
    console.log("Sample license already exists.");
  }

  // Setup Minio buckets
  console.log("Setting up Minio buckets...");
  
  const buckets = ['uploads', 'public'];
  
  for (const bucketName of buckets) {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Created bucket: ${bucketName}`);
      
      // Set public read policy for public bucket
      if (bucketName === 'public') {
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Set public read policy for bucket: ${bucketName}`);
      }
    } else {
      console.log(`Bucket already exists: ${bucketName}`);
    }
  }
  
  console.log("Minio setup complete.");

  console.log("Database setup complete.");
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
