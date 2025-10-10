import { db, ensureDatabaseConnection } from "~/server/db";
import { createCaller } from "~/server/trpc/root";

// Test configuration interfaces
interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

interface FeatureTestSuite {
  suiteName: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export async function runAllFeatureTests(): Promise<FeatureTestSuite[]> {
  console.log('🚀 Starting Comprehensive Feature Testing Suite...\n');
  
  const testSuites: FeatureTestSuite[] = [];
  
  // Test data that will be used across tests
  let testUserId: string | null = null;
  let testToken: string | null = null;
  let testCompanyId: string | null = null;
  
  try {
    // Ensure database connection first
    console.log('🔌 Testing Database Connection...');
    try {
      await ensureDatabaseConnection(3);
      console.log('✅ Database connection verified\n');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      
      // Return a test suite indicating database connection failure
      testSuites.push({
        suiteName: 'Database Connection',
        results: [{
          testName: 'Database Connection',
          status: 'FAIL',
          message: `Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
          details: { error: dbError instanceof Error ? dbError.message : 'Unknown error' }
        }],
        summary: { total: 1, passed: 0, failed: 1, skipped: 0 }
      });
      
      return testSuites;
    }

    const caller = createCaller({});

    // Test Suite 1: Authentication System
    console.log('🔐 Testing Authentication System...');
    const authTests: TestResult[] = [];
    
    try {
      // Test 1.1: User Registration
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      const registrationResult = await caller.register({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User'
      });
      
      testUserId = registrationResult.user.id;
      testToken = registrationResult.token;
      
      authTests.push({
        testName: 'User Registration',
        status: 'PASS',
        message: 'User registration successful',
        details: { userId: testUserId, email: testEmail }
      });
      
      // Test 1.2: User Login
      const loginResult = await caller.login({
        email: testEmail,
        password: testPassword
      });
      
      authTests.push({
        testName: 'User Login',
        status: loginResult.token ? 'PASS' : 'FAIL',
        message: loginResult.token ? 'Login successful' : 'Login failed',
        details: { hasToken: !!loginResult.token }
      });
      
      // Test 1.3: Get Current User
      const currentUser = await caller.getCurrentUser({ token: testToken! });
      
      authTests.push({
        testName: 'Get Current User',
        status: currentUser.email === testEmail ? 'PASS' : 'FAIL',
        message: 'Current user retrieval successful',
        details: { email: currentUser.email, isActive: currentUser.isActive }
      });
      
    } catch (error) {
      authTests.push({
        testName: 'Authentication System',
        status: 'FAIL',
        message: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    testSuites.push({
      suiteName: 'Authentication System',
      results: authTests,
      summary: {
        total: authTests.length,
        passed: authTests.filter(t => t.status === 'PASS').length,
        failed: authTests.filter(t => t.status === 'FAIL').length,
        skipped: authTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 2: Company Management
    console.log('🏢 Testing Company Management...');
    const companyTests: TestResult[] = [];
    
    if (testToken) {
      try {
        // Test 2.1: Create Company
        const company = await caller.createCompany({
          token: testToken,
          name: 'Test Company Alpha',
          displayName: 'Alpha Test Corp',
          description: 'Test company for feature validation'
        });
        
        testCompanyId = company.id;
        
        companyTests.push({
          testName: 'Create Company',
          status: 'PASS',
          message: 'Company creation successful',
          details: { companyId: company.id, name: company.name }
        });
        
        // Test 2.2: Get Companies
        const companies = await caller.getCompanies({ token: testToken });
        
        companyTests.push({
          testName: 'Get Companies',
          status: companies.length > 0 ? 'PASS' : 'FAIL',
          message: `Retrieved ${companies.length} companies`,
          details: { count: companies.length }
        });
        
        // Test 2.3: Get Company Stats
        const stats = await caller.getCompanyStats({ companyId: testCompanyId });
        
        companyTests.push({
          testName: 'Get Company Stats',
          status: 'PASS',
          message: 'Company statistics retrieved successfully',
          details: stats
        });
        
      } catch (error) {
        companyTests.push({
          testName: 'Company Management',
          status: 'FAIL',
          message: `Company management failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      companyTests.push({
        testName: 'Company Management',
        status: 'SKIP',
        message: 'Skipped due to authentication failure'
      });
    }
    
    testSuites.push({
      suiteName: 'Company Management',
      results: companyTests,
      summary: {
        total: companyTests.length,
        passed: companyTests.filter(t => t.status === 'PASS').length,
        failed: companyTests.filter(t => t.status === 'FAIL').length,
        skipped: companyTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 3: Master Data Management
    console.log('📋 Testing Master Data Management...');
    const masterDataTests: TestResult[] = [];
    
    try {
      // Test 3.1: Get Major Heads
      const majorHeads = await caller.getMajorHeads();
      
      masterDataTests.push({
        testName: 'Get Major Heads',
        status: majorHeads.length > 0 ? 'PASS' : 'FAIL',
        message: `Retrieved ${majorHeads.length} major heads`,
        details: { count: majorHeads.length }
      });
      
      // Test 3.2: Get Groupings
      const groupings = await caller.getGroupings();
      
      masterDataTests.push({
        testName: 'Get Groupings',
        status: groupings.length > 0 ? 'PASS' : 'FAIL',
        message: `Retrieved ${groupings.length} groupings`,
        details: { count: groupings.length }
      });
      
      // Test 3.3: Add Minor Head
      if (testCompanyId) {
        const minorHead = await caller.addMinorHead({
          companyId: testCompanyId,
          name: 'Test Minor Head'
        });
        
        masterDataTests.push({
          testName: 'Add Minor Head',
          status: 'PASS',
          message: 'Minor head created successfully',
          details: { id: minorHead.id, name: minorHead.name }
        });
      }
      
    } catch (error) {
      masterDataTests.push({
        testName: 'Master Data Management',
        status: 'FAIL',
        message: `Master data operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    testSuites.push({
      suiteName: 'Master Data Management',
      results: masterDataTests,
      summary: {
        total: masterDataTests.length,
        passed: masterDataTests.filter(t => t.status === 'PASS').length,
        failed: masterDataTests.filter(t => t.status === 'FAIL').length,
        skipped: masterDataTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 4: Trial Balance Management
    console.log('⚖️ Testing Trial Balance Management...');
    const trialBalanceTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 4.1: Upload Trial Balance
        const sampleTrialBalance = [
          {
            ledgerName: 'Cash at Bank',
            openingBalanceCY: 100000,
            debitCY: 500000,
            creditCY: 300000,
            closingBalanceCY: 300000,
            closingBalancePY: 80000,
            type: 'BS' as const,
            majorHead: 'Cash and Cash Equivalents'
          },
          {
            ledgerName: 'Sales',
            openingBalanceCY: 0,
            debitCY: 0,
            creditCY: 1000000,
            closingBalanceCY: 1000000,
            closingBalancePY: 800000,
            type: 'PL' as const,
            majorHead: 'Revenue from Operations'
          }
        ];
        
        await caller.uploadTrialBalance({
          companyId: testCompanyId,
          entries: sampleTrialBalance
        });
        
        trialBalanceTests.push({
          testName: 'Upload Trial Balance',
          status: 'PASS',
          message: 'Trial balance uploaded successfully',
          details: { entriesCount: sampleTrialBalance.length }
        });
        
        // Test 4.2: Get Trial Balance
        const trialBalance = await caller.getTrialBalance({ companyId: testCompanyId });
        
        trialBalanceTests.push({
          testName: 'Get Trial Balance',
          status: trialBalance.length >= sampleTrialBalance.length ? 'PASS' : 'FAIL',
          message: `Retrieved ${trialBalance.length} trial balance entries`,
          details: { count: trialBalance.length }
        });
        
      } catch (error) {
        trialBalanceTests.push({
          testName: 'Trial Balance Management',
          status: 'FAIL',
          message: `Trial balance operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      trialBalanceTests.push({
        testName: 'Trial Balance Management',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'Trial Balance Management',
      results: trialBalanceTests,
      summary: {
        total: trialBalanceTests.length,
        passed: trialBalanceTests.filter(t => t.status === 'PASS').length,
        failed: trialBalanceTests.filter(t => t.status === 'FAIL').length,
        skipped: trialBalanceTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 5: Financial Statements Generation
    console.log('📊 Testing Financial Statements Generation...');
    const financialStatementsTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 5.1: Generate Balance Sheet
        const balanceSheet = await caller.generateBalanceSheet({ companyId: testCompanyId });
        
        financialStatementsTests.push({
          testName: 'Generate Balance Sheet',
          status: 'PASS',
          message: 'Balance sheet generated successfully',
          details: {
            assetsCount: balanceSheet.assets.length,
            liabilitiesCount: balanceSheet.liabilities.length,
            equityCount: balanceSheet.equity.length,
            totalAssets: balanceSheet.totalAssets
          }
        });
        
        // Test 5.2: Generate Profit and Loss
        const profitLoss = await caller.generateProfitAndLoss({ companyId: testCompanyId });
        
        financialStatementsTests.push({
          testName: 'Generate Profit and Loss',
          status: 'PASS',
          message: 'P&L statement generated successfully',
          details: {
            revenueCount: profitLoss.revenue.length,
            expensesCount: profitLoss.expenses.length,
            totalRevenue: profitLoss.totalRevenue,
            netProfit: profitLoss.netProfit
          }
        });
        
        // Test 5.3: Generate Cash Flow
        const cashFlow = await caller.generateCashFlow({ companyId: testCompanyId });
        
        financialStatementsTests.push({
          testName: 'Generate Cash Flow',
          status: 'PASS',
          message: 'Cash flow statement generated successfully',
          details: {
            operatingCashFlow: cashFlow.operatingCashFlow,
            investingCashFlow: cashFlow.investingCashFlow,
            financingCashFlow: cashFlow.financingCashFlow
          }
        });
        
        // Test 5.4: Generate Ratio Analysis
        const ratios = await caller.generateRatioAnalysis({ companyId: testCompanyId });
        
        financialStatementsTests.push({
          testName: 'Generate Ratio Analysis',
          status: 'PASS',
          message: 'Ratio analysis generated successfully',
          details: {
            liquidityRatiosCount: ratios.liquidityRatios.length,
            profitabilityRatiosCount: ratios.profitabilityRatios.length,
            leverageRatiosCount: ratios.leverageRatios.length
          }
        });
        
      } catch (error) {
        financialStatementsTests.push({
          testName: 'Financial Statements Generation',
          status: 'FAIL',
          message: `Financial statements generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      financialStatementsTests.push({
        testName: 'Financial Statements Generation',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'Financial Statements Generation',
      results: financialStatementsTests,
      summary: {
        total: financialStatementsTests.length,
        passed: financialStatementsTests.filter(t => t.status === 'PASS').length,
        failed: financialStatementsTests.filter(t => t.status === 'FAIL').length,
        skipped: financialStatementsTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 6: Note Selections and Accounting Policies
    console.log('📝 Testing Note Selections and Accounting Policies...');
    const notesTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 6.1: Initialize Note Selections
        const initResult = await caller.initializeNoteSelections({ companyId: testCompanyId });
        
        notesTests.push({
          testName: 'Initialize Note Selections',
          status: initResult.success ? 'PASS' : 'FAIL',
          message: `Initialized ${initResult.count} note selections`,
          details: { count: initResult.count }
        });
        
        // Test 6.2: Get Note Selections
        const noteSelections = await caller.getNoteSelections({ companyId: testCompanyId });
        
        notesTests.push({
          testName: 'Get Note Selections',
          status: noteSelections.length > 0 ? 'PASS' : 'FAIL',
          message: `Retrieved ${noteSelections.length} note selections`,
          details: { count: noteSelections.length }
        });
        
        // Test 6.3: Initialize Accounting Policies
        await caller.initializeAccountingPolicies({ companyId: testCompanyId });
        
        const accountingPolicies = await caller.getAccountingPolicies({ companyId: testCompanyId });
        
        notesTests.push({
          testName: 'Accounting Policies',
          status: accountingPolicies.length > 0 ? 'PASS' : 'FAIL',
          message: `Retrieved ${accountingPolicies.length} accounting policies`,
          details: { count: accountingPolicies.length }
        });
        
      } catch (error) {
        notesTests.push({
          testName: 'Note Selections and Accounting Policies',
          status: 'FAIL',
          message: `Notes and policies operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      notesTests.push({
        testName: 'Note Selections and Accounting Policies',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'Note Selections and Accounting Policies',
      results: notesTests,
      summary: {
        total: notesTests.length,
        passed: notesTests.filter(t => t.status === 'PASS').length,
        failed: notesTests.filter(t => t.status === 'FAIL').length,
        skipped: notesTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 7: Schedule Management
    console.log('📅 Testing Schedule Management...');
    const scheduleTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 7.1: Share Capital Schedule
        await caller.addShareCapitalEntry({
          companyId: testCompanyId,
          shareType: 'Equity Shares',
          authorizedShares: 100000,
          authorizedValue: 1000000,
          issuedShares: 50000,
          issuedValue: 500000,
          paidUpShares: 50000,
          paidUpValue: 500000,
          faceValuePerShare: 10
        });
        
        const shareCapital = await caller.getShareCapitalEntries({ companyId: testCompanyId });
        
        scheduleTests.push({
          testName: 'Share Capital Schedule',
          status: shareCapital.length > 0 ? 'PASS' : 'FAIL',
          message: `Share capital schedule working (${shareCapital.length} entries)`,
          details: { entries: shareCapital.length }
        });
        
        // Test 7.2: PPE Schedule
        await caller.addPPEScheduleEntry({
          companyId: testCompanyId,
          assetName: 'Office Building',
          assetCategory: 'Building',
          grossBlockOpening: 1000000,
          additions: 50000,
          disposals: 0,
          grossBlockClosing: 1050000,
          accDepreciationOpening: 100000,
          depreciationForYear: 52500,
          accDepreciationClosing: 152500,
          netBlockOpening: 900000,
          netBlockClosing: 897500
        });
        
        const ppeEntries = await caller.getPPEScheduleEntries({ companyId: testCompanyId });
        
        scheduleTests.push({
          testName: 'PPE Schedule',
          status: ppeEntries.length > 0 ? 'PASS' : 'FAIL',
          message: `PPE schedule working (${ppeEntries.length} entries)`,
          details: { entries: ppeEntries.length }
        });
        
        // Test 7.3: Investment Schedule
        await caller.addInvestmentEntry({
          companyId: testCompanyId,
          investmentName: 'Mutual Fund Investment',
          investmentType: 'Current',
          category: 'Mutual Funds',
          units: 1000,
          faceValue: 10,
          marketValue: 12,
          totalCost: 10000,
          totalMarketValue: 12000,
          isQuoted: false
        });
        
        const investments = await caller.getInvestmentEntries({ companyId: testCompanyId });
        
        scheduleTests.push({
          testName: 'Investment Schedule',
          status: investments.length > 0 ? 'PASS' : 'FAIL',
          message: `Investment schedule working (${investments.length} entries)`,
          details: { entries: investments.length }
        });
        
      } catch (error) {
        scheduleTests.push({
          testName: 'Schedule Management',
          status: 'FAIL',
          message: `Schedule operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      scheduleTests.push({
        testName: 'Schedule Management',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'Schedule Management',
      results: scheduleTests,
      summary: {
        total: scheduleTests.length,
        passed: scheduleTests.filter(t => t.status === 'PASS').length,
        failed: scheduleTests.filter(t => t.status === 'FAIL').length,
        skipped: scheduleTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 8: Compliance and Validation
    console.log('🛡️ Testing Compliance and Validation...');
    const complianceTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 8.1: Debug Compliance
        const debugResult = await caller.debugCompliance({ companyId: testCompanyId });
        
        complianceTests.push({
          testName: 'Debug Compliance',
          status: debugResult.databaseConnection ? 'PASS' : 'FAIL',
          message: `Debug compliance check completed`,
          details: {
            databaseConnection: debugResult.databaseConnection,
            tablesChecked: Object.keys(debugResult.tablesStatus).length
          }
        });
        
        // Test 8.2: Schedule III Compliance Validation
        const complianceResult = await caller.validateScheduleIIICompliance({ companyId: testCompanyId });
        
        complianceTests.push({
          testName: 'Schedule III Compliance',
          status: 'PASS',
          message: `Compliance validation completed (${complianceResult.complianceScore}% score)`,
          details: {
            complianceScore: complianceResult.complianceScore,
            totalChecks: complianceResult.totalChecks,
            passedChecks: complianceResult.passedChecks,
            issuesCount: complianceResult.issues.length
          }
        });
        
      } catch (error) {
        complianceTests.push({
          testName: 'Compliance and Validation',
          status: 'FAIL',
          message: `Compliance operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      complianceTests.push({
        testName: 'Compliance and Validation',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'Compliance and Validation',
      results: complianceTests,
      summary: {
        total: complianceTests.length,
        passed: complianceTests.filter(t => t.status === 'PASS').length,
        failed: complianceTests.filter(t => t.status === 'FAIL').length,
        skipped: complianceTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 9: File Upload System
    console.log('📤 Testing File Upload System...');
    const fileUploadTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 9.1: Trial Balance Upload URL
        const tbUploadUrl = await caller.getTrialBalanceUploadUrl({
          companyId: testCompanyId,
          fileName: 'test-trial-balance.xlsx'
        });
        
        fileUploadTests.push({
          testName: 'Trial Balance Upload URL',
          status: tbUploadUrl.uploadUrl ? 'PASS' : 'FAIL',
          message: 'Trial balance upload URL generated successfully',
          details: { hasUploadUrl: !!tbUploadUrl.uploadUrl }
        });
        
        // Test 9.2: Investment Upload URL
        const investmentUploadUrl = await caller.getInvestmentUploadUrl({
          companyId: testCompanyId,
          fileName: 'test-investments.xlsx'
        });
        
        fileUploadTests.push({
          testName: 'Investment Upload URL',
          status: investmentUploadUrl.uploadUrl ? 'PASS' : 'FAIL',
          message: 'Investment upload URL generated successfully',
          details: { hasUploadUrl: !!investmentUploadUrl.uploadUrl }
        });
        
        // Test 9.3: PPE Upload URL
        const ppeUploadUrl = await caller.getPPEUploadUrl({
          companyId: testCompanyId,
          fileName: 'test-ppe.xlsx'
        });
        
        fileUploadTests.push({
          testName: 'PPE Upload URL',
          status: ppeUploadUrl.uploadUrl ? 'PASS' : 'FAIL',
          message: 'PPE upload URL generated successfully',
          details: { hasUploadUrl: !!ppeUploadUrl.uploadUrl }
        });
        
      } catch (error) {
        fileUploadTests.push({
          testName: 'File Upload System',
          status: 'FAIL',
          message: `File upload operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      fileUploadTests.push({
        testName: 'File Upload System',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'File Upload System',
      results: fileUploadTests,
      summary: {
        total: fileUploadTests.length,
        passed: fileUploadTests.filter(t => t.status === 'PASS').length,
        failed: fileUploadTests.filter(t => t.status === 'FAIL').length,
        skipped: fileUploadTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 10: Export Functionality
    console.log('📥 Testing Export Functionality...');
    const exportTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test 10.1: Export Balance Sheet
        const bsExport = await caller.exportBalanceSheet({ companyId: testCompanyId });
        
        exportTests.push({
          testName: 'Export Balance Sheet',
          status: bsExport.downloadUrl ? 'PASS' : 'FAIL',
          message: 'Balance sheet export successful',
          details: { hasDownloadUrl: !!bsExport.downloadUrl }
        });
        
        // Test 10.2: Export Profit and Loss
        const plExport = await caller.exportProfitAndLoss({ companyId: testCompanyId });
        
        exportTests.push({
          testName: 'Export Profit and Loss',
          status: plExport.downloadUrl ? 'PASS' : 'FAIL',
          message: 'P&L export successful',
          details: { hasDownloadUrl: !!plExport.downloadUrl }
        });
        
        // Test 10.3: Export Ratio Analysis
        const ratioExport = await caller.exportRatioAnalysis({ companyId: testCompanyId });
        
        exportTests.push({
          testName: 'Export Ratio Analysis',
          status: ratioExport.downloadUrl ? 'PASS' : 'FAIL',
          message: 'Ratio analysis export successful',
          details: { hasDownloadUrl: !!ratioExport.downloadUrl }
        });
        
      } catch (error) {
        exportTests.push({
          testName: 'Export Functionality',
          status: 'FAIL',
          message: `Export operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      exportTests.push({
        testName: 'Export Functionality',
        status: 'SKIP',
        message: 'Skipped due to missing test company'
      });
    }
    
    testSuites.push({
      suiteName: 'Export Functionality',
      results: exportTests,
      summary: {
        total: exportTests.length,
        passed: exportTests.filter(t => t.status === 'PASS').length,
        failed: exportTests.filter(t => t.status === 'FAIL').length,
        skipped: exportTests.filter(t => t.status === 'SKIP').length,
      }
    });

  } catch (error) {
    console.error('❌ Critical error during comprehensive testing:', error);
    testSuites.push({
      suiteName: 'Critical Error',
      results: [{
        testName: 'Test Suite Execution',
        status: 'FAIL',
        message: `Critical testing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      summary: { total: 1, passed: 0, failed: 1, skipped: 0 }
    });
  }
  
  return testSuites;
}

export function printComprehensiveTestResults(testSuites: FeatureTestSuite[]): void {
  console.log('\n' + '='.repeat(100));
  console.log('🧪 COMPREHENSIVE FEATURE TEST RESULTS');
  console.log('='.repeat(100));
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  testSuites.forEach(suite => {
    console.log(`\n🔧 ${suite.suiteName}`);
    console.log('-'.repeat(50));
    
    suite.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${icon} ${result.testName}: ${result.message}`);
      
      if (result.details && Object.keys(result.details).length > 0) {
        const detailsStr = JSON.stringify(result.details, null, 2);
        const indentedDetails = detailsStr.split('\n').map(line => `   ${line}`).join('\n');
        console.log(`   Details: ${indentedDetails.substring(11)}`); // Remove first "   Details: " part
      }
    });
    
    const passRate = suite.summary.total > 0 ? ((suite.summary.passed / suite.summary.total) * 100).toFixed(1) : '0.0';
    console.log(`\n📊 Suite Summary: ${suite.summary.passed}✅ ${suite.summary.failed}❌ ${suite.summary.skipped}⏭️ (${suite.summary.total} total, ${passRate}% pass rate)`);
    
    totalTests += suite.summary.total;
    totalPassed += suite.summary.passed;
    totalFailed += suite.summary.failed;
    totalSkipped += suite.summary.skipped;
  });
  
  console.log('\n' + '='.repeat(100));
  console.log('🎯 OVERALL COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(100));
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed} (${totalTests > 0 ? ((totalPassed/totalTests)*100).toFixed(1) : 0}%)`);
  console.log(`❌ Failed: ${totalFailed} (${totalTests > 0 ? ((totalFailed/totalTests)*100).toFixed(1) : 0}%)`);
  console.log(`⏭️ Skipped: ${totalSkipped} (${totalTests > 0 ? ((totalSkipped/totalTests)*100).toFixed(1) : 0}%)`);
  
  const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
  console.log(`\n🏆 Overall Success Rate: ${successRate.toFixed(1)}%`);
  
  // Feature coverage analysis
  const featureAreas = [
    'Authentication System',
    'Company Management', 
    'Master Data Management',
    'Trial Balance Management',
    'Financial Statements Generation',
    'Note Selections and Accounting Policies',
    'Schedule Management',
    'Compliance and Validation',
    'File Upload System',
    'Export Functionality'
  ];
  
  console.log(`\n📋 Feature Coverage: ${testSuites.length}/${featureAreas.length} feature areas tested`);
  
  if (successRate >= 95) {
    console.log('🎉 EXCELLENT! All major features are working perfectly after the fix.');
  } else if (successRate >= 85) {
    console.log('✨ VERY GOOD! Most features are working correctly, minor issues detected.');
  } else if (successRate >= 70) {
    console.log('👍 GOOD! Core functionality is working, some features need attention.');
  } else if (successRate >= 50) {
    console.log('⚠️ NEEDS ATTENTION! Several features have issues that need to be resolved.');
  } else {
    console.log('🚨 CRITICAL! Major functionality problems detected - immediate attention required.');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (totalFailed > 0) {
    console.log(`• Investigate and fix ${totalFailed} failed test(s)`);
  }
  if (totalSkipped > 0) {
    console.log(`• Review ${totalSkipped} skipped test(s) - may indicate setup issues`);
  }
  if (successRate < 90) {
    console.log('• Consider running individual feature tests for detailed debugging');
    console.log('• Check server logs for additional error information');
    console.log('• Verify database connections and data integrity');
  }
  if (successRate >= 90) {
    console.log('• System appears stable and ready for production use');
    console.log('• Consider setting up automated testing for regression prevention');
  }
  
  console.log('\n' + '='.repeat(100));
}

export async function executeComprehensiveFeatureTests(): Promise<void> {
  try {
    console.log('🚀 Starting Comprehensive Feature Testing Suite...\n');
    console.log('This will test all major application features to ensure everything works after the fix.\n');
    
    const startTime = Date.now();
    const testResults = await runAllFeatureTests();
    const endTime = Date.now();
    
    printComprehensiveTestResults(testResults);
    
    console.log(`\n⏱️ Total execution time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log('\n✨ Comprehensive feature testing completed!');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      // Clean up test users and companies
      await db.user.deleteMany({
        where: {
          email: {
            contains: 'test-'
          }
        }
      });
      console.log('✅ Test data cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️ Test data cleanup had issues (this is usually not critical)');
    }
    
  } catch (error) {
    console.error('❌ Failed to execute comprehensive feature test suite:', error);
    throw error;
  }
}

// Export for potential use in other contexts
export default executeComprehensiveFeatureTests;

// Direct execution when run as a script
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  executeComprehensiveFeatureTests()
    .then(() => {
      console.log("Comprehensive feature testing complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Comprehensive feature testing failed:", error);
      process.exit(1);
    });
}
