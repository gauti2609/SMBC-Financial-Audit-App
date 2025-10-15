/**
 * Script to bundle Node.js runtime for the Electron app
 * This ensures the app can run on Windows machines without Node.js installed
 * 
 * This script copies the current Node.js executable to the resources folder
 * so it can be bundled with the Electron installer.
 */

import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PLATFORM = process.platform;
const NODE_EXE = process.execPath;

async function bundleNode() {
  const outputDir = join(__dirname, '..', 'resources', 'node');
  
  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log('✅ Created directory:', outputDir);
  }

  console.log('📦 Bundling Node.js runtime for Electron app...');
  console.log(`   Version: ${process.version}`);
  console.log(`   Platform: ${PLATFORM}`);
  console.log(`   Architecture: ${process.arch}`);
  console.log(`   Source: ${NODE_EXE}`);
  console.log(`   Output: ${outputDir}`);
  console.log('');

  try {
    const targetName = PLATFORM === 'win32' ? 'node.exe' : 'node';
    const targetPath = join(outputDir, targetName);
    
    copyFileSync(NODE_EXE, targetPath);
    console.log(`✅ Copied ${targetName} to resources/node/`);
    console.log('');
    console.log('🎉 Node.js runtime bundled successfully!');
    console.log('   This will be included in the Electron installer.');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to copy Node.js executable:', error.message);
    throw error;
  }
}

bundleNode()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
