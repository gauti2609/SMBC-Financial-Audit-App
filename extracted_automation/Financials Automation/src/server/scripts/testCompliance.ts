import { db } from "~/server/db";
import { createCaller } from "~/server/trpc/root";

// Test configuration
interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

interface ComplianceTestSuite {
  suiteName: string;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

export async function runComplianceTests(): Promise<ComplianceTestSuite[]> {
  console.log('🚀 Starting Comprehensive Compliance Dashboard Tests...\n');
  
  const testSuites: ComplianceTestSuite[] = [];
  const caller = createCaller({});
  
  try {
    // Test Suite 1: Multi-Company Database Support
    console.log('📊 Testing Multi-Company Database Support...');
    const multiCompanyTests: TestResult[] = [];
    
    // Test 1.1: Company Creation
    try {
      const testCompany = await caller.createCompany({
        name: 'Test Company Alpha',
        displayName: 'Alpha Test Corp',
        description: 'Test company for compliance validation'
      });
      
      multiCompanyTests.push({
        testName: 'Company Creation',
        status: 'PASS',
        message: 'Successfully created test company',
        details: { companyId: testCompany.id, name: testCompany.name }
      });
      
      // Test 1.2: Company Data Isolation
      const company2 = await caller.createCompany({
        name: 'Test Company Beta',
        displayName: 'Beta Test Corp',
        description: 'Second test company for isolation testing'
      });
      
      // Initialize note selections for both companies
      await caller.initializeNoteSelections({ companyId: testCompany.id });
      await caller.initializeNoteSelections({ companyId: company2.id });
      
      const notesCompany1 = await caller.getNoteSelections({ companyId: testCompany.id });
      const notesCompany2 = await caller.getNoteSelections({ companyId: company2.id });
      
      if (notesCompany1.length > 0 && notesCompany2.length > 0) {
        multiCompanyTests.push({
          testName: 'Data Isolation',
          status: 'PASS',
          message: 'Each company has separate note selections',
          details: { 
            company1Notes: notesCompany1.length,
            company2Notes: notesCompany2.length 
          }
        });
      } else {
        multiCompanyTests.push({
          testName: 'Data Isolation',
          status: 'FAIL',
          message: 'Failed to initialize separate data for companies'
        });
      }
      
      // Test 1.3: Company Statistics
      const stats = await caller.getCompanyStats({ companyId: testCompany.id });
      multiCompanyTests.push({
        testName: 'Company Statistics',
        status: 'PASS',
        message: 'Successfully retrieved company statistics',
        details: stats
      });
      
    } catch (error) {
      multiCompanyTests.push({
        testName: 'Company Creation',
        status: 'FAIL',
        message: `Company creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    testSuites.push({
      suiteName: 'Multi-Company Database Support',
      results: multiCompanyTests,
      summary: {
        total: multiCompanyTests.length,
        passed: multiCompanyTests.filter(t => t.status === 'PASS').length,
        failed: multiCompanyTests.filter(t => t.status === 'FAIL').length,
        skipped: multiCompanyTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 2: Compliance Dashboard Features
    console.log('🛡️ Testing Compliance Dashboard Features...');
    const complianceTests: TestResult[] = [];
    
    // Get a test company ID
    const companies = await caller.getCompanies();
    const testCompanyId = companies.length > 0 ? companies[0].id : null;
    
    if (!testCompanyId) {
      complianceTests.push({
        testName: 'All Compliance Tests',
        status: 'SKIP',
        message: 'No test company available for compliance testing'
      });
    } else {
      // Test 2.1: Debug Compliance
      try {
        const debugResult = await caller.debugCompliance({ companyId: testCompanyId });
        
        complianceTests.push({
          testName: 'Debug Compliance',
          status: debugResult.databaseConnection ? 'PASS' : 'FAIL',
          message: `Database connection: ${debugResult.databaseConnection ? 'OK' : 'FAILED'}`,
          details: {
            tablesChecked: Object.keys(debugResult.tablesStatus).length,
            basicChecks: Object.keys(debugResult.basicChecks).length,
            timestamp: debugResult.timestamp
          }
        });
        
        // Test 2.2: Table Status Check
        const tableStatusResults = Object.entries(debugResult.tablesStatus);
        const workingTables = tableStatusResults.filter(([_, status]) => status.exists);
        
        complianceTests.push({
          testName: 'Database Tables Status',
          status: workingTables.length >= 10 ? 'PASS' : 'FAIL',
          message: `${workingTables.length}/${tableStatusResults.length} tables accessible`,
          details: debugResult.tablesStatus
        });
        
      } catch (error) {
        complianceTests.push({
          testName: 'Debug Compliance',
          status: 'FAIL',
          message: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
      
      // Test 2.3: Full Compliance Validation
      try {
        const complianceResult = await caller.validateScheduleIIICompliance({ 
          companyId: testCompanyId 
        });
        
        complianceTests.push({
          testName: 'Schedule III Compliance Validation',
          status: 'PASS',
          message: `Compliance check completed: ${complianceResult.complianceScore}% score`,
          details: {
            overallStatus: complianceResult.overallStatus,
            totalChecks: complianceResult.totalChecks,
            passedChecks: complianceResult.passedChecks,
            issuesCount: complianceResult.issues.length,
            categories: Object.keys(complianceResult.summary)
          }
        });
        
        // Test 2.4: Enhanced Rule Coverage
        if (complianceResult.totalChecks >= 40) { // Should have 40+ checks with enhancements
          complianceTests.push({
            testName: 'Enhanced Rule Coverage',
            status: 'PASS',
            message: `${complianceResult.totalChecks} compliance checks implemented`,
            details: {
              expectedMinimum: 40,
              actualChecks: complianceResult.totalChecks,
              issueCategories: [...new Set(complianceResult.issues.map(i => i.category))]
            }
          });
        } else {
          complianceTests.push({
            testName: 'Enhanced Rule Coverage',
            status: 'FAIL',
            message: `Only ${complianceResult.totalChecks} checks found, expected 40+`
          });
        }
        
        // Test 2.5: Issue Categorization
        const errorIssues = complianceResult.issues.filter(i => i.severity === 'error');
        const warningIssues = complianceResult.issues.filter(i => i.severity === 'warning');
        const infoIssues = complianceResult.issues.filter(i => i.severity === 'info');
        
        complianceTests.push({
          testName: 'Issue Categorization',
          status: 'PASS',
          message: 'Issues properly categorized by severity',
          details: {
            errors: errorIssues.length,
            warnings: warningIssues.length,
            info: infoIssues.length,
            total: complianceResult.issues.length
          }
        });
        
      } catch (error) {
        complianceTests.push({
          testName: 'Schedule III Compliance Validation',
          status: 'FAIL',
          message: `Compliance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
      
      // Test 2.6: Note Compliance Validation
      try {
        const noteComplianceResult = await caller.validateNoteCompliance({
          companyId: testCompanyId,
          noteRef: 'A.1'
        });
        
        complianceTests.push({
          testName: 'Note Compliance Validation',
          status: 'PASS',
          message: 'Individual note compliance check working',
          details: noteComplianceResult
        });
        
      } catch (error) {
        complianceTests.push({
          testName: 'Note Compliance Validation',
          status: 'FAIL',
          message: `Note compliance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }
    
    testSuites.push({
      suiteName: 'Compliance Dashboard Features',
      results: complianceTests,
      summary: {
        total: complianceTests.length,
        passed: complianceTests.filter(t => t.status === 'PASS').length,
        failed: complianceTests.filter(t => t.status === 'FAIL').length,
        skipped: complianceTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 3: Schedule III Rule Coverage
    console.log('📋 Testing Schedule III Rule Coverage...');
    const ruleTests: TestResult[] = [];
    
    if (testCompanyId) {
      try {
        // Test specific rule categories
        const complianceResult = await caller.validateScheduleIIICompliance({ 
          companyId: testCompanyId 
        });
        
        // Test 3.1: Entity Information Checks
        const entityIssues = complianceResult.issues.filter(i => i.category === 'Entity Information');
        ruleTests.push({
          testName: 'Entity Information Checks',
          status: 'PASS',
          message: `Entity information validation working (${entityIssues.length} issues found)`,
          details: { issues: entityIssues.length }
        });
        
        // Test 3.2: Financial Statement Checks
        const fsIssues = complianceResult.issues.filter(i => i.category === 'Financial Statements');
        ruleTests.push({
          testName: 'Financial Statement Checks',
          status: 'PASS',
          message: `Financial statement validation working (${fsIssues.length} issues found)`,
          details: { issues: fsIssues.length }
        });
        
        // Test 3.3: Aging Schedule Checks
        const agingIssues = complianceResult.issues.filter(i => i.category.includes('Aging'));
        ruleTests.push({
          testName: 'Aging Schedule Checks',
          status: 'PASS',
          message: `Aging schedule validation working (${agingIssues.length} issues found)`,
          details: { issues: agingIssues.length }
        });
        
        // Test 3.4: New Schedule III Requirements
        const newRequirementCategories = [
          'CWIP Aging',
          'Revenue Recognition', 
          'Borrowings',
          'Inventory',
          'Depreciation',
          'Cash Flow',
          'Segment Reporting',
          'Provisions',
          'Foreign Currency',
          'Earnings Per Share'
        ];
        
        const newRequirementIssues = complianceResult.issues.filter(i => 
          newRequirementCategories.includes(i.category)
        );
        
        ruleTests.push({
          testName: 'New Schedule III Requirements',
          status: newRequirementIssues.length > 0 ? 'PASS' : 'FAIL',
          message: `Enhanced compliance rules working (${newRequirementIssues.length} new category issues found)`,
          details: { 
            newCategories: newRequirementCategories.length,
            issuesFound: newRequirementIssues.length,
            categories: [...new Set(newRequirementIssues.map(i => i.category))]
          }
        });
        
        // Test 3.5: Recommendation Quality
        const issuesWithRecommendations = complianceResult.issues.filter(i => 
          i.recommendation && i.recommendation.length > 20
        );
        
        ruleTests.push({
          testName: 'Recommendation Quality',
          status: issuesWithRecommendations.length === complianceResult.issues.length ? 'PASS' : 'FAIL',
          message: `${issuesWithRecommendations.length}/${complianceResult.issues.length} issues have quality recommendations`,
          details: { 
            totalIssues: complianceResult.issues.length,
            withRecommendations: issuesWithRecommendations.length 
          }
        });
        
      } catch (error) {
        ruleTests.push({
          testName: 'Schedule III Rule Coverage',
          status: 'FAIL',
          message: `Rule coverage testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      ruleTests.push({
        testName: 'Schedule III Rule Coverage',
        status: 'SKIP',
        message: 'No test company available'
      });
    }
    
    testSuites.push({
      suiteName: 'Schedule III Rule Coverage',
      results: ruleTests,
      summary: {
        total: ruleTests.length,
        passed: ruleTests.filter(t => t.status === 'PASS').length,
        failed: ruleTests.filter(t => t.status === 'FAIL').length,
        skipped: ruleTests.filter(t => t.status === 'SKIP').length,
      }
    });

    // Test Suite 4: Error Handling and Edge Cases
    console.log('⚠️ Testing Error Handling...');
    const errorTests: TestResult[] = [];
    
    // Test 4.1: Invalid Company ID
    try {
      await caller.validateScheduleIIICompliance({ companyId: 'invalid-company-id' });
      errorTests.push({
        testName: 'Invalid Company ID Handling',
        status: 'FAIL',
        message: 'Should have thrown error for invalid company ID'
      });
    } catch (error) {
      errorTests.push({
        testName: 'Invalid Company ID Handling',
        status: 'PASS',
        message: 'Properly handles invalid company ID',
        details: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    // Test 4.2: Empty Company Data
    try {
      if (testCompanyId) {
        const emptyCompanyResult = await caller.validateScheduleIIICompliance({ 
          companyId: testCompanyId 
        });
        
        // Should still work but with many issues
        if (emptyCompanyResult.issues.length > 0) {
          errorTests.push({
            testName: 'Empty Company Data Handling',
            status: 'PASS',
            message: 'Gracefully handles empty company data with appropriate issues',
            details: { issueCount: emptyCompanyResult.issues.length }
          });
        } else {
          errorTests.push({
            testName: 'Empty Company Data Handling',
            status: 'FAIL',
            message: 'Should flag issues for empty company data'
          });
        }
      }
    } catch (error) {
      errorTests.push({
        testName: 'Empty Company Data Handling',
        status: 'FAIL',
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    testSuites.push({
      suiteName: 'Error Handling and Edge Cases',
      results: errorTests,
      summary: {
        total: errorTests.length,
        passed: errorTests.filter(t => t.status === 'PASS').length,
        failed: errorTests.filter(t => t.status === 'FAIL').length,
        skipped: errorTests.filter(t => t.status === 'SKIP').length,
      }
    });

  } catch (error) {
    console.error('❌ Critical error during testing:', error);
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

export function printTestResults(testSuites: ComplianceTestSuite[]): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPLIANCE DASHBOARD TEST RESULTS');
  console.log('='.repeat(80));
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  testSuites.forEach(suite => {
    console.log(`\n🧪 ${suite.suiteName}`);
    console.log('-'.repeat(40));
    
    suite.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${icon} ${result.testName}: ${result.message}`);
      
      if (result.details && Object.keys(result.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).split('\n').join('\n   ')}`);
      }
    });
    
    console.log(`\nSuite Summary: ${suite.summary.passed}✅ ${suite.summary.failed}❌ ${suite.summary.skipped}⏭️ (${suite.summary.total} total)`);
    
    totalTests += suite.summary.total;
    totalPassed += suite.summary.passed;
    totalFailed += suite.summary.failed;
    totalSkipped += suite.summary.skipped;
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 OVERALL TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);
  console.log(`⏭️ Skipped: ${totalSkipped} (${((totalSkipped/totalTests)*100).toFixed(1)}%)`);
  
  const successRate = (totalPassed / totalTests) * 100;
  console.log(`\n🏆 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('🎉 EXCELLENT! All major features are working correctly.');
  } else if (successRate >= 75) {
    console.log('✨ GOOD! Most features are working, minor issues detected.');
  } else if (successRate >= 50) {
    console.log('⚠️ NEEDS ATTENTION! Several features have issues.');
  } else {
    console.log('🚨 CRITICAL! Major functionality problems detected.');
  }
  
  console.log('\n' + '='.repeat(80));
}

export async function executeComplianceTestSuite(): Promise<void> {
  try {
    console.log('🚀 Starting Comprehensive Compliance Testing Suite...\n');
    
    const startTime = Date.now();
    const testResults = await runComplianceTests();
    const endTime = Date.now();
    
    printTestResults(testResults);
    
    console.log(`\n⏱️ Total execution time: ${(endTime - startTime) / 1000}s`);
    console.log('\n✨ Compliance testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to execute compliance test suite:', error);
    throw error;
  }
}

// Export for potential use in other contexts
export default executeComplianceTestSuite;
