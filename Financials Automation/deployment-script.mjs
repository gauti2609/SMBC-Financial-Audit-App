import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
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

function maskSensitiveValue(value) {
  if (!value) return 'NOT SET';
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

async function runDiagnosticPhase() {
  console.log('🔍 Running system diagnostics...');
  console.log('');
  
  try {
    const diagnosticResult = await new Promise((resolve, reject) => {
      const diagnosticProcess = spawn('node', ['diagnostic-test.mjs'], {
        stdio: 'inherit',
        env: process.env,
        cwd: __dirname
      });
      
      diagnosticProcess.on('close', (code) => {
        resolve(code === 0);
      });
      
      diagnosticProcess.on('error', (error) => {
        console.error('❌ Failed to run diagnostic test:', error);
        reject(error);
      });
    });
    
    return diagnosticResult;
  } catch (error) {
    console.error('❌ Diagnostic phase failed:', error);
    return false;
  }
}

async function runTestingPhase() {
  console.log('🧪 Running comprehensive feature tests...');
  console.log('');
  
  try {
    const testResult = await new Promise((resolve, reject) => {
      const testProcess = spawn('node', ['test-runner.mjs'], {
        stdio: 'inherit',
        env: process.env,
        cwd: __dirname
      });
      
      testProcess.on('close', (code) => {
        resolve(code === 0);
      });
      
      testProcess.on('error', (error) => {
        console.error('❌ Failed to run feature tests:', error);
        reject(error);
      });
    });
    
    return testResult;
  } catch (error) {
    console.error('❌ Testing phase failed:', error);
    return false;
  }
}

async function runProductionPhase() {
  console.log('🏭 Preparing for production deployment...');
  console.log('');
  
  // Load current environment
  loadEnvFile();
  
  // Check current environment variables
  console.log('📋 Current Environment Configuration:');
  console.log('====================================');
  
  const envVars = {
    'NODE_ENV': process.env.NODE_ENV || 'NOT SET',
    'DATABASE_URL': process.env.DATABASE_URL ? maskSensitiveValue(process.env.DATABASE_URL) : 'NOT SET',
    'JWT_SECRET': process.env.JWT_SECRET ? 'SET (masked)' : 'NOT SET',
    'ADMIN_PASSWORD': process.env.ADMIN_PASSWORD ? 'SET (masked)' : 'NOT SET'
  };
  
  for (const [key, value] of Object.entries(envVars)) {
    const status = value === 'NOT SET' ? '❌' : '✅';
    console.log(`   ${status} ${key}: ${value}`);
  }
  
  console.log('');
  console.log('🔧 Production Environment Requirements:');
  console.log('======================================');
  console.log('');
  
  // Production environment analysis
  analyzeProductionRequirements();
  
  console.log('');
  console.log('🏗️  Windows .exe Build Instructions:');
  console.log('===================================');
  
  printBuildInstructions();
  
  console.log('');
  console.log('🚀 Deployment Steps:');
  console.log('====================');
  
  printDeploymentSteps();
}

function analyzeProductionRequirements() {
  const requirements = [
    {
      variable: 'DATABASE_URL',
      current: process.env.DATABASE_URL,
      production: 'postgresql://username:password@your-server:5432/production_db',
      mustChange: true,
      reason: 'Must point to production PostgreSQL server'
    },
    {
      variable: 'JWT_SECRET',
      current: process.env.JWT_SECRET,
      production: 'Generate a new secure 32+ character secret',
      mustChange: true,
      reason: 'Security requirement - use unique production secret'
    },
    {
      variable: 'ADMIN_PASSWORD',
      current: process.env.ADMIN_PASSWORD,
      production: 'Create a strong admin password',
      mustChange: true,
      reason: 'Security requirement - use unique production password'
    },
    {
      variable: 'NODE_ENV',
      current: process.env.NODE_ENV,
      production: 'production',
      mustChange: process.env.NODE_ENV !== 'production',
      reason: 'Must be set to production for optimized builds'
    }
  ];
  
  console.log('Environment Variable Analysis:');
  console.log('');
  
  requirements.forEach(req => {
    const changeRequired = req.mustChange ? '🔴 MUST CHANGE' : '✅ OK';
    const currentValue = req.current ? maskSensitiveValue(req.current) : 'NOT SET';
    
    console.log(`📌 ${req.variable}:`);
    console.log(`   Current: ${currentValue}`);
    console.log(`   Production: ${req.production}`);
    console.log(`   Status: ${changeRequired}`);
    console.log(`   Reason: ${req.reason}`);
    console.log('');
  });
}

function printBuildInstructions() {
  console.log('1️⃣ Prerequisites:');
  console.log('   • Node.js 18+ installed');
  console.log('   • pnpm package manager');
  console.log('   • Git for version control');
  console.log('   • Windows 10/11 for .exe generation');
  console.log('');
  
  console.log('2️⃣ Build Commands:');
  console.log('   # Install dependencies');
  console.log('   pnpm install');
  console.log('');
  console.log('   # Build web application');
  console.log('   pnpm run build');
  console.log('');
  console.log('   # Compile Electron scripts');
  console.log('   pnpm run build:electron');
  console.log('');
  console.log('   # Generate Windows installer');
  console.log('   pnpm run electron:dist:win');
  console.log('');
  
  console.log('3️⃣ Output Location:');
  console.log('   • Windows installer: dist-electron/');
  console.log('   • Filename: Financial Statement Generator-1.0.0-windows-x64.exe');
  console.log('   • Portable version: Financial Statement Generator-1.0.0-Portable.exe');
}

function printDeploymentSteps() {
  console.log('1️⃣ Update Environment Variables:');
  console.log('   Option A - System Environment Variables:');
  console.log('     • Open Windows Settings > System > About > Advanced system settings');
  console.log('     • Click "Environment Variables"');
  console.log('     • Add/modify the required variables');
  console.log('');
  console.log('   Option B - Application Configuration File:');
  console.log('     • Create config.env in the application directory');
  console.log('     • Add production environment variables');
  console.log('');
  
  console.log('2️⃣ Database Setup:');
  console.log('   • Install PostgreSQL server on target machine or network');
  console.log('   • Configure network access and firewall rules');
  console.log('   • Update DATABASE_URL to point to production database');
  console.log('');
  
  console.log('3️⃣ Application Installation:');
  console.log('   • Run the generated .exe installer');
  console.log('   • Follow the installation wizard');
  console.log('   • Configure database connection via the UI');
  console.log('');
  
  console.log('4️⃣ Verification:');
  console.log('   • Launch the application');
  console.log('   • Test database connectivity');
  console.log('   • Verify all features are working');
  console.log('   • Create a test company and generate reports');
  console.log('');
  
  console.log('📋 Production Checklist:');
  console.log('   ☐ Environment variables updated for production');
  console.log('   ☐ Database server configured and accessible');
  console.log('   ☐ Application built and installer generated');
  console.log('   ☐ Installation tested on target machine');
  console.log('   ☐ All features verified to work correctly');
  console.log('   ☐ Backup and recovery procedures in place');
}

async function runDeploymentPipeline() {
  console.log('🚀 Financial Statement Generator - Windows Deployment Pipeline');
  console.log('==============================================================');
  console.log('');
  
  const phases = [
    { name: 'Development Verification', phase: 1 },
    { name: 'Feature Testing', phase: 2 },
    { name: 'Production Preparation', phase: 3 }
  ];
  
  let currentPhase = 1;
  const startTime = Date.now();
  
  try {
    // Phase 1: Development Verification
    console.log(`📋 Phase ${currentPhase}: Development Verification`);
    console.log('=' .repeat(50));
    const diagnosticResult = await runDiagnosticPhase();
    
    if (!diagnosticResult) {
      console.log('❌ Development verification failed. Cannot proceed to testing.');
      return false;
    }
    
    currentPhase++;
    console.log('\n✅ Phase 1 completed successfully!\n');
    
    // Phase 2: Feature Testing  
    console.log(`🧪 Phase ${currentPhase}: Feature Testing`);
    console.log('=' .repeat(50));
    const testResult = await runTestingPhase();
    
    if (!testResult) {
      console.log('❌ Feature testing failed. Cannot proceed to production preparation.');
      return false;
    }
    
    currentPhase++;
    console.log('\n✅ Phase 2 completed successfully!\n');
    
    // Phase 3: Production Preparation
    console.log(`🏭 Phase ${currentPhase}: Production Preparation`);
    console.log('=' .repeat(50));
    await runProductionPhase();
    
    console.log('\n✅ Phase 3 completed successfully!\n');
    
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('🎉 DEPLOYMENT PIPELINE COMPLETED SUCCESSFULLY!');
    console.log('============================================');
    console.log(`⏱️  Total execution time: ${totalTime}s`);
    console.log('');
    console.log('🎯 All phases completed:');
    console.log('   ✅ Development verification passed');
    console.log('   ✅ Feature testing passed');
    console.log('   ✅ Production preparation completed');
    console.log('');
    console.log('🚀 Ready for Windows .exe deployment!');
    
    return true;
    
  } catch (error) {
    console.error(`❌ Deployment pipeline failed at Phase ${currentPhase}:`, error);
    return false;
  }
}

// Execute the deployment pipeline
console.log('🎯 Starting Financial Statement Generator Deployment Pipeline...\n');

runDeploymentPipeline()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Deployment pipeline completed successfully!');
      console.log('Ready for Windows .exe generation and deployment.');
      process.exit(0);
    } else {
      console.log('\n❌ Deployment pipeline failed.');
      console.log('Please review the errors above and try again.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Deployment pipeline crashed:', error);
    process.exit(1);
  });
