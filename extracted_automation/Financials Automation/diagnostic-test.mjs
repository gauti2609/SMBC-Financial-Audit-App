import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

async function runDiagnostics() {
  console.log('🔍 Running Financial Reporting System Diagnostics...');
  console.log('===================================================');
  console.log('');
  
  loadEnvFile();
  process.env.NODE_ENV = 'development';
  
  const diagnostics = {
    environment: [],
    files: [],
    dependencies: [],
    structure: []
  };
  
  // Check 1: Environment Variables
  console.log('📋 Checking Environment Configuration...');
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_PASSWORD'];
  for (const envVar of requiredEnvVars) {
    const isSet = !!process.env[envVar];
    diagnostics.environment.push({
      name: envVar,
      status: isSet ? 'SET' : 'MISSING',
      value: isSet ? '***' : 'Not set'
    });
    console.log(`   ${isSet ? '✅' : '❌'} ${envVar}: ${isSet ? 'Set' : 'Missing'}`);
  }
  console.log('');
  
  // Check 2: Critical Files
  console.log('📁 Checking Critical Application Files...');
  const criticalFiles = [
    'src/server/db.ts',
    'src/server/trpc/root.ts',
    'src/server/scripts/testAllFeatures.ts',
    'src/server/scripts/testCompliance.ts',
    'src/server/trpc/procedures/auth.ts',
    'src/server/trpc/procedures/companyManagement.ts',
    'src/server/trpc/procedures/validateScheduleIIICompliance.ts',
    'prisma/schema.prisma',
    'package.json'
  ];
  
  for (const file of criticalFiles) {
    const exists = fs.existsSync(join(__dirname, file));
    diagnostics.files.push({
      name: file,
      status: exists ? 'EXISTS' : 'MISSING'
    });
    console.log(`   ${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
  }
  console.log('');
  
  // Check 3: Package.json Dependencies
  console.log('📦 Checking Package Dependencies...');
  try {
    const packageJsonPath = join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const criticalDeps = [
      '@prisma/client',
      '@trpc/server',
      '@trpc/client',
      'zod',
      'tsx',
      'prisma',
      'react',
      'react-dom'
    ];
    
    for (const dep of criticalDeps) {
      const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      diagnostics.dependencies.push({
        name: dep,
        status: version ? 'FOUND' : 'MISSING',
        version: version || 'Not found'
      });
      console.log(`   ${version ? '✅' : '❌'} ${dep}: ${version || 'Missing'}`);
    }
  } catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
  }
  console.log('');
  
  // Check 4: TypeScript Compilation Test
  console.log('🔧 Testing TypeScript Compilation...');
  try {
    const testTsFile = join(__dirname, 'temp-ts-test.ts');
    const testContent = `
import { z } from "zod";

// Test basic TypeScript compilation
const testSchema = z.object({
  test: z.string()
});

console.log("TypeScript compilation test successful");
`;
    
    fs.writeFileSync(testTsFile, testContent);
    
    const tsCompileResult = await new Promise((resolve) => {
      const tsProcess = spawn('npx', ['tsx', 'temp-ts-test.ts'], {
        cwd: __dirname,
        stdio: 'pipe'
      });
      
      let output = '';
      let error = '';
      
      tsProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      tsProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      tsProcess.on('close', (code) => {
        // Clean up test file
        try {
          fs.unlinkSync(testTsFile);
        } catch (e) {}
        
        resolve({ code, output, error });
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        tsProcess.kill();
        resolve({ code: -1, output, error: 'Timeout' });
      }, 10000);
    });
    
    if (tsCompileResult.code === 0) {
      console.log('   ✅ TypeScript compilation: Working');
      diagnostics.structure.push({ name: 'TypeScript Compilation', status: 'WORKING' });
    } else {
      console.log('   ❌ TypeScript compilation: Failed');
      console.log(`      Error: ${tsCompileResult.error}`);
      diagnostics.structure.push({ name: 'TypeScript Compilation', status: 'FAILED', error: tsCompileResult.error });
    }
  } catch (error) {
    console.log(`   ❌ TypeScript compilation test failed: ${error.message}`);
    diagnostics.structure.push({ name: 'TypeScript Compilation', status: 'FAILED', error: error.message });
  }
  console.log('');
  
  // Check 5: Basic Import Test
  console.log('📥 Testing Basic Imports...');
  try {
    const importTestFile = join(__dirname, 'temp-import-test.ts');
    const importTestContent = `
// Test if we can import our main modules
try {
  console.log("Testing imports...");
  
  // Test environment loading
  import { env } from "./src/server/env.js";
  console.log("✅ Environment import successful");
  
  console.log("Import test completed");
} catch (error) {
  console.error("❌ Import test failed:", error.message);
  process.exit(1);
}
`;
    
    fs.writeFileSync(importTestFile, importTestContent);
    
    const importTestResult = await new Promise((resolve) => {
      const importProcess = spawn('npx', ['tsx', 'temp-import-test.ts'], {
        cwd: __dirname,
        stdio: 'pipe',
        env: process.env
      });
      
      let output = '';
      let error = '';
      
      importProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      importProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      importProcess.on('close', (code) => {
        // Clean up test file
        try {
          fs.unlinkSync(importTestFile);
        } catch (e) {}
        
        resolve({ code, output, error });
      });
      
      // Timeout after 15 seconds
      setTimeout(() => {
        importProcess.kill();
        resolve({ code: -1, output, error: 'Timeout' });
      }, 15000);
    });
    
    if (importTestResult.code === 0) {
      console.log('   ✅ Basic imports: Working');
      console.log('   Output:', importTestResult.output.trim());
      diagnostics.structure.push({ name: 'Basic Imports', status: 'WORKING' });
    } else {
      console.log('   ❌ Basic imports: Failed');
      console.log(`   Error: ${importTestResult.error}`);
      diagnostics.structure.push({ name: 'Basic Imports', status: 'FAILED', error: importTestResult.error });
    }
  } catch (error) {
    console.log(`   ❌ Import test failed: ${error.message}`);
    diagnostics.structure.push({ name: 'Basic Imports', status: 'FAILED', error: error.message });
  }
  console.log('');
  
  // Summary
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('====================');
  
  const envIssues = diagnostics.environment.filter(e => e.status === 'MISSING').length;
  const fileIssues = diagnostics.files.filter(f => f.status === 'MISSING').length;
  const depIssues = diagnostics.dependencies.filter(d => d.status === 'MISSING').length;
  const structureIssues = diagnostics.structure.filter(s => s.status === 'FAILED').length;
  
  console.log(`Environment: ${envIssues === 0 ? '✅' : '❌'} ${envIssues} issues`);
  console.log(`Files: ${fileIssues === 0 ? '✅' : '❌'} ${fileIssues} missing`);
  console.log(`Dependencies: ${depIssues === 0 ? '✅' : '❌'} ${depIssues} missing`);
  console.log(`Structure: ${structureIssues === 0 ? '✅' : '❌'} ${structureIssues} failed`);
  
  const totalIssues = envIssues + fileIssues + depIssues + structureIssues;
  
  console.log('');
  if (totalIssues === 0) {
    console.log('🎉 All diagnostics passed! System appears ready for testing.');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   • Start database services (PostgreSQL, MinIO)');
    console.log('   • Run: node test-runner.mjs');
    console.log('   • Or run: npm run test-features');
  } else {
    console.log(`⚠️ Found ${totalIssues} issues that need attention.`);
    console.log('');
    console.log('💡 Recommended fixes:');
    
    if (envIssues > 0) {
      console.log('   • Set missing environment variables in .env file');
    }
    if (fileIssues > 0) {
      console.log('   • Restore missing critical files');
    }
    if (depIssues > 0) {
      console.log('   • Install missing dependencies: npm install or pnpm install');
    }
    if (structureIssues > 0) {
      console.log('   • Fix TypeScript/import issues before running tests');
    }
  }
  
  console.log('');
  console.log('✨ Diagnostics completed!');
  
  return totalIssues === 0;
}

// Run diagnostics
runDiagnostics()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Diagnostics failed:', error);
    process.exit(1);
  });
