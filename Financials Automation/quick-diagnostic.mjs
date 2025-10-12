import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Quick System Diagnostic for Windows Deployment');
console.log('================================================');
console.log('');

// Check current environment
function checkEnvironment() {
  console.log('📋 Environment Check:');
  console.log('--------------------');
  
  const envPath = join(__dirname, '.env');
  const configTemplatePath = join(__dirname, 'config.env.template');
  
  console.log(`✅ .env file: ${fs.existsSync(envPath) ? 'Found' : 'Missing'}`);
  console.log(`✅ config.env.template: ${fs.existsSync(configTemplatePath) ? 'Found' : 'Missing'}`);
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('   Current .env variables:');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key] = trimmedLine.split('=');
        console.log(`   • ${key}: Set`);
      }
    });
  }
  
  console.log('');
}

// Check critical files
function checkCriticalFiles() {
  console.log('📁 Critical Files Check:');
  console.log('------------------------');
  
  const criticalFiles = [
    'package.json',
    'electron-builder.config.js',
    'electron/main.ts',
    'electron/preload.ts',
    'src/server/scripts/testAllFeatures.ts',
    'deployment-script.mjs',
    'diagnostic-test.mjs'
  ];
  
  criticalFiles.forEach(file => {
    const exists = fs.existsSync(join(__dirname, file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  });
  
  console.log('');
}

// Check build directories
function checkBuildSetup() {
  console.log('🏗️  Build Setup Check:');
  console.log('----------------------');
  
  const distExists = fs.existsSync(join(__dirname, 'dist'));
  const electronExists = fs.existsSync(join(__dirname, 'electron'));
  const nodeModulesExists = fs.existsSync(join(__dirname, 'node_modules'));
  
  console.log(`   ${distExists ? '✅' : '⚠️ '} dist/ directory: ${distExists ? 'Ready' : 'Will be created on build'}`);
  console.log(`   ${electronExists ? '✅' : '❌'} electron/ directory: ${electronExists ? 'Found' : 'Missing'}`);
  console.log(`   ${nodeModulesExists ? '✅' : '❌'} node_modules/ directory: ${nodeModulesExists ? 'Found' : 'Missing - run pnpm install'}`);
  
  console.log('');
}

async function runQuickDiagnostic() {
  checkEnvironment();
  checkCriticalFiles();
  checkBuildSetup();
  
  console.log('🔧 Running Full Diagnostic Test...');
  console.log('==================================');
  console.log('');
  
  // Run the full diagnostic test
  const diagnosticProcess = spawn('node', ['diagnostic-test.mjs'], {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname
  });
  
  return new Promise((resolve, reject) => {
    diagnosticProcess.on('close', (code) => {
      console.log('');
      if (code === 0) {
        console.log('✅ Diagnostic tests passed! System ready for deployment testing.');
      } else {
        console.log('❌ Diagnostic tests failed. Please address issues before proceeding.');
      }
      resolve(code);
    });
    
    diagnosticProcess.on('error', (error) => {
      console.error('❌ Failed to run diagnostic test:', error);
      reject(error);
    });
  });
}

// Execute the diagnostic
runQuickDiagnostic()
  .then((code) => {
    console.log('');
    console.log('🎯 Quick Diagnostic Complete!');
    console.log('');
    if (code === 0) {
      console.log('📝 Next step: Run the full deployment pipeline');
      console.log('   Command: node run-deployment-test.mjs');
    } else {
      console.log('🔧 Fix the issues above before running the deployment pipeline');
    }
    process.exit(code);
  })
  .catch((error) => {
    console.error('Quick diagnostic failed:', error);
    process.exit(1);
  });
