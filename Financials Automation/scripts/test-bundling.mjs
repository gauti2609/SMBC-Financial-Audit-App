#!/usr/bin/env node
/**
 * Test script to verify the Node.js bundling and path detection logic
 * This simulates what happens in a packaged Electron app
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Node.js bundling logic...\n');

// Test 1: Check if Node.js was bundled
const bundledNodePath = join(__dirname, '..', 'resources', 'node', process.platform === 'win32' ? 'node.exe' : 'node');
console.log('Test 1: Check if Node.js was bundled');
console.log(`  Looking for: ${bundledNodePath}`);
console.log(`  Exists: ${existsSync(bundledNodePath) ? '✅ YES' : '❌ NO'}`);

if (existsSync(bundledNodePath)) {
  const fs = await import('fs');
  const stats = fs.statSync(bundledNodePath);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}
console.log('');

// Test 2: Simulate packaged app path resolution
console.log('Test 2: Simulate packaged app path resolution');
const simulatedResourcesPath = join(__dirname, '..', 'resources');
const simulatedNodePath = join(simulatedResourcesPath, 'node', process.platform === 'win32' ? 'node.exe' : 'node');
console.log(`  Simulated resourcesPath: ${simulatedResourcesPath}`);
console.log(`  Expected Node.js path: ${simulatedNodePath}`);
console.log(`  Would work: ${existsSync(simulatedNodePath) ? '✅ YES' : '❌ NO'}`);
console.log('');

// Test 3: Check electron-builder config
console.log('Test 3: Check electron-builder configuration');
try {
  const configPath = join(__dirname, '..', 'electron-builder.config.cjs');
  const configContent = (await import('fs')).readFileSync(configPath, 'utf-8');
  
  const hasNodeResource = configContent.includes("from: 'resources/node'");
  console.log(`  Has resources/node in extraResources: ${hasNodeResource ? '✅ YES' : '❌ NO'}`);
  
  if (hasNodeResource) {
    const match = configContent.match(/from:\s*'resources\/node',\s*to:\s*'([^']+)'/);
    if (match) {
      console.log(`  Maps to: '${match[1]}'`);
    }
  }
} catch (error) {
  console.log(`  ❌ Error reading config: ${error.message}`);
}
console.log('');

// Test 4: Check package.json scripts
console.log('Test 4: Check build scripts');
try {
  const packagePath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse((await import('fs')).readFileSync(packagePath, 'utf-8'));
  
  const hasBundleNode = packageJson.scripts['bundle-node'];
  console.log(`  Has bundle-node script: ${hasBundleNode ? '✅ YES' : '❌ NO'}`);
  
  const distWin = packageJson.scripts['electron:dist:win'];
  const includesBundleNode = distWin && distWin.includes('bundle-node');
  console.log(`  dist:win includes bundle-node: ${includesBundleNode ? '✅ YES' : '❌ NO'}`);
  
  if (distWin) {
    console.log(`  Command: ${distWin}`);
  }
} catch (error) {
  console.log(`  ❌ Error reading package.json: ${error.message}`);
}
console.log('');

// Test 5: Verify main.ts has the logic
console.log('Test 5: Check main.ts for Node.js detection logic');
try {
  const mainPath = join(__dirname, '..', 'electron', 'main.ts');
  const mainContent = (await import('fs')).readFileSync(mainPath, 'utf-8');
  
  const hasBundledLogic = mainContent.includes('bundledNodePath');
  console.log(`  Has bundled Node.js detection: ${hasBundledLogic ? '✅ YES' : '❌ NO'}`);
  
  const hasProcessResources = mainContent.includes('process.resourcesPath');
  console.log(`  Uses process.resourcesPath: ${hasProcessResources ? '✅ YES' : '❌ NO'}`);
  
  const hasNodeExeCheck = mainContent.includes("'node.exe'");
  console.log(`  Checks for node.exe (Windows): ${hasNodeExeCheck ? '✅ YES' : '❌ NO'}`);
} catch (error) {
  console.log(`  ❌ Error reading main.ts: ${error.message}`);
}
console.log('');

// Test 6: Check main.cjs is compiled
console.log('Test 6: Check main.cjs is compiled with latest changes');
try {
  const mainCjsPath = join(__dirname, '..', 'electron', 'main.cjs');
  const mainCjsContent = (await import('fs')).readFileSync(mainCjsPath, 'utf-8');
  
  const hasBundledLogic = mainCjsContent.includes('bundledNodePath');
  console.log(`  Has bundled Node.js detection: ${hasBundledLogic ? '✅ YES' : '❌ NO'}`);
  
  const hasNodeExeCheck = mainCjsContent.includes("'node.exe'");
  console.log(`  Checks for node.exe (Windows): ${hasNodeExeCheck ? '✅ YES' : '❌ NO'}`);
} catch (error) {
  console.log(`  ❌ Error reading main.cjs: ${error.message}`);
}
console.log('');

console.log('📊 Summary:');
console.log('============');
console.log('If all tests show ✅, the bundling logic is correctly configured.');
console.log('If you still see "spawn node ENOENT" error, ensure you:');
console.log('  1. Run "npm run bundle-node" before building');
console.log('  2. Run "npm run build:electron" to compile TypeScript');
console.log('  3. Run "npm run dist:win" to create the installer');
console.log('  4. Install the NEW installer (not an old one)');
console.log('  5. Test on a machine WITHOUT Node.js installed');
