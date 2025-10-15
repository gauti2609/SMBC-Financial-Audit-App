#!/usr/bin/env node
/**
 * Diagnostic script to help troubleshoot "spawn node ENOENT" issues
 * Run this to identify what's wrong with your setup
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Financial Statement Generator - Diagnostics\n');
console.log('This script will help identify why "spawn node ENOENT" might still occur.\n');
console.log('='.repeat(70));
console.log('');

let issuesFound = 0;
let warnings = 0;

// Helper function to check and report
function check(testName, condition, fixMessage) {
  if (condition) {
    console.log(`✅ ${testName}`);
    return true;
  } else {
    console.log(`❌ ${testName}`);
    if (fixMessage) {
      console.log(`   Fix: ${fixMessage}`);
    }
    issuesFound++;
    return false;
  }
}

function warn(testName, message) {
  console.log(`⚠️  ${testName}`);
  console.log(`   ${message}`);
  warnings++;
}

// Test 1: Check Node.js is installed (for build)
console.log('📋 Build Environment Checks\n');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  check(`Node.js is installed: ${nodeVersion}`, true);
} catch (error) {
  check('Node.js is installed', false, 'Install Node.js 20+ from https://nodejs.org/');
}

// Test 2: Check npm is available
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  check(`npm is installed: ${npmVersion}`, true);
} catch (error) {
  check('npm is installed', false, 'npm should be installed with Node.js');
}

// Test 3: Check if node_modules exists
const nodeModulesPath = join(__dirname, '..', 'node_modules');
check(
  'Dependencies installed (node_modules exists)',
  existsSync(nodeModulesPath),
  'Run: npm install'
);

console.log('');
console.log('🔧 Bundling Configuration Checks\n');

// Test 4: Check if bundle-node script exists
const packageJsonPath = join(__dirname, '..', 'package.json');
try {
  const packageJson = JSON.parse((await import('fs')).readFileSync(packageJsonPath, 'utf-8'));
  check(
    'bundle-node script exists in package.json',
    !!packageJson.scripts['bundle-node'],
    'The fix may not be applied. Check out the latest code.'
  );
  
  // Test 5: Check if dist:win includes bundle-node
  const distWin = packageJson.scripts['electron:dist:win'] || '';
  check(
    'Build script includes bundle-node step',
    distWin.includes('bundle-node'),
    'Update package.json electron:dist:win script'
  );
} catch (error) {
  check('package.json is readable', false, `Error: ${error.message}`);
}

// Test 6: Check if bundled Node.js exists
const bundledNodePath = join(__dirname, '..', 'resources', 'node', 
  process.platform === 'win32' ? 'node.exe' : 'node');
  
if (check(
  'Node.js has been bundled (resources/node exists)',
  existsSync(bundledNodePath),
  'Run: npm run bundle-node'
)) {
  const fs = await import('fs');
  const stats = fs.statSync(bundledNodePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   Size: ${sizeMB} MB`);
  if (stats.size < 50 * 1024 * 1024) { // Less than 50MB
    warn('Bundled Node.js size is suspiciously small', 
      `Expected ~90MB, got ${sizeMB}MB. Re-run: npm run bundle-node`);
  }
}

console.log('');
console.log('📝 Code Changes Checks\n');

// Test 7: Check main.ts has bundling logic
const mainTsPath = join(__dirname, '..', 'electron', 'main.ts');
try {
  const mainTsContent = (await import('fs')).readFileSync(mainTsPath, 'utf-8');
  check(
    'main.ts has Node.js bundling logic',
    mainTsContent.includes('bundledNodePath'),
    'The fix may not be applied. Check out the latest code.'
  );
  
  check(
    'main.ts checks for node.exe on Windows',
    mainTsContent.includes("'node.exe'"),
    'Update main.ts with the bundling logic'
  );
} catch (error) {
  check('main.ts is readable', false, `Error: ${error.message}`);
}

// Test 8: Check main.cjs is compiled
const mainCjsPath = join(__dirname, '..', 'electron', 'main.cjs');
try {
  const mainCjsContent = (await import('fs')).readFileSync(mainCjsPath, 'utf-8');
  check(
    'main.cjs is compiled with bundling logic',
    mainCjsContent.includes('bundledNodePath'),
    'Run: npm run build:electron'
  );
} catch (error) {
  check('main.cjs exists', false, 'Run: npm run build:electron');
}

// Test 9: Check electron-builder config
const builderConfigPath = join(__dirname, '..', 'electron-builder.config.cjs');
try {
  const builderConfig = (await import('fs')).readFileSync(builderConfigPath, 'utf-8');
  check(
    'electron-builder.config includes resources/node',
    builderConfig.includes("from: 'resources/node'"),
    'Update electron-builder.config.cjs to include resources/node in extraResources'
  );
} catch (error) {
  check('electron-builder.config.cjs is readable', false, `Error: ${error.message}`);
}

console.log('');
console.log('📦 Build Artifacts Checks\n');

// Test 10: Check if .output exists
const outputPath = join(__dirname, '..', '.output');
if (check(
  'Application has been built (.output exists)',
  existsSync(outputPath),
  'Run: npm run build'
)) {
  // Check for server file
  const serverPath = join(outputPath, 'server', 'index.mjs');
  check(
    'Server file exists (.output/server/index.mjs)',
    existsSync(serverPath),
    'Server build may have failed. Check build logs.'
  );
}

// Test 11: Check if installer exists
const distPath = join(__dirname, '..', 'dist-electron');
if (existsSync(distPath)) {
  console.log('✅ Installer directory exists (dist-electron)');
  try {
    const files = (await import('fs')).readdirSync(distPath);
    const exeFiles = files.filter(f => f.endsWith('.exe'));
    if (exeFiles.length > 0) {
      console.log(`   Found installer: ${exeFiles[0]}`);
      warn('Installer exists', 
        'Make sure you test the NEWLY built installer, not an old one!');
    } else {
      warn('No .exe installer found', 'Run: npm run dist:win');
    }
  } catch (error) {
    warn('Cannot read dist-electron directory', error.message);
  }
} else {
  check(
    'Installer has been built (dist-electron exists)',
    false,
    'Run: npm run dist:win'
  );
}

console.log('');
console.log('='.repeat(70));
console.log('');
console.log('📊 DIAGNOSTIC SUMMARY\n');

if (issuesFound === 0 && warnings === 0) {
  console.log('✅ All checks passed! The configuration is correct.');
  console.log('');
  console.log('If you\'re still seeing "spawn node ENOENT":');
  console.log('  1. Make sure you built a NEW installer: npm run dist:win');
  console.log('  2. Test with the newly built installer from dist-electron/');
  console.log('  3. Test on a machine WITHOUT Node.js installed');
  console.log('  4. Check application logs for specific error messages');
} else {
  console.log(`Found ${issuesFound} issue(s) and ${warnings} warning(s).\n`);
  console.log('Fix the issues marked with ❌ above, then:');
  console.log('  1. Run: npm run dist:win');
  console.log('  2. Test the NEW installer');
  console.log('');
  console.log('For step-by-step instructions, see: STEP_BY_STEP_BUILD_GUIDE.md');
}

console.log('');
console.log('💡 Need Help?');
console.log('  • Run: node scripts/test-bundling.mjs (for detailed config check)');
console.log('  • Read: STEP_BY_STEP_BUILD_GUIDE.md (for build instructions)');
console.log('  • Read: NODE_BUNDLING_README.md (for troubleshooting)');
console.log('');

process.exit(issuesFound > 0 ? 1 : 0);
