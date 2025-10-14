#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const symlinkPath = path.join(rootDir, 'generated');
const targetPath = path.join(rootDir, 'src', 'generated');

console.log('🔗 Setting up Prisma symlink...');

try {
  // Check if symlink already exists
  if (fs.existsSync(symlinkPath)) {
    const stats = fs.lstatSync(symlinkPath);
    
    if (stats.isSymbolicLink()) {
      console.log('✅ Prisma symlink already exists');
      process.exit(0);
    } else {
      console.error('❌ A file/directory named "generated" already exists but is not a symlink');
      console.error('   Please remove it manually before running this script');
      process.exit(1);
    }
  }

  // Create the symlink
  fs.symlinkSync('src/generated', symlinkPath, 'dir');
  console.log('✅ Created symlink: generated -> src/generated');
  
} catch (error) {
  console.error('❌ Failed to create Prisma symlink:', error.message);
  process.exit(1);
}
