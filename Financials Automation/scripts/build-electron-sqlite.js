#!/usr/bin/env node

/**
 * Build script for Electron app with SQLite support
 * This script:
 * 1. Temporarily modifies the Prisma schema to use SQLite
 * 2. Generates the Prisma client for SQLite
 * 3. Builds the application
 * 4. Restores the original schema
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const BACKUP_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma.backup');

console.log('[Build Script] Starting Electron build with SQLite support...');

// Read the original schema
const originalSchema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

// Backup the original schema
fs.writeFileSync(BACKUP_PATH, originalSchema);
console.log('[Build Script] Original schema backed up');

try {
  // Modify schema to use SQLite
  const sqliteSchema = originalSchema.replace(
    /provider\s*=\s*"postgresql"/g,
    'provider = "sqlite"'
  );
  
  fs.writeFileSync(SCHEMA_PATH, sqliteSchema);
  console.log('[Build Script] Schema modified to use SQLite');
  
  // Generate Prisma client for SQLite
  console.log('[Build Script] Generating Prisma client for SQLite...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Build the application
  console.log('[Build Script] Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Build Electron scripts
  console.log('[Build Script] Building Electron scripts...');
  execSync('npm run build:electron', { stdio: 'inherit' });
  
  console.log('[Build Script] Build completed successfully!');
  
} catch (error) {
  console.error('[Build Script] Build failed:', error.message);
  process.exitCode = 1;
} finally {
  // Restore the original schema
  fs.writeFileSync(SCHEMA_PATH, originalSchema);
  fs.unlinkSync(BACKUP_PATH);
  console.log('[Build Script] Original schema restored');
}
