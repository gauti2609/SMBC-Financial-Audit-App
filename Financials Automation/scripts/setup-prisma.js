#!/usr/bin/env node

/**
 * Setup Prisma Client
 * 
 * This script ensures Prisma Client is generated after all dependencies are installed.
 * It helps avoid race conditions where prisma generate runs before @prisma/client is fully extracted.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔧 Setting up Prisma Client...');

// Check if .env file exists
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  Warning: .env file not found. Prisma may not work without DATABASE_URL.');
  console.warn('   Copy config.env.template to .env and configure your database connection.');
}

// Check if @prisma/client package exists
const prismaClientPath = path.join(rootDir, 'node_modules', '@prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  console.error('❌ @prisma/client package not found. Please run pnpm install first.');
  process.exit(1);
}
console.log('✅ @prisma/client package found');

// Wait a moment to ensure all files are fully extracted (especially on Windows)
console.log('⏳ Waiting for package extraction to complete...');
await new Promise(resolve => setTimeout(resolve, 1000));

// Generate Prisma client
try {
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { 
    cwd: rootDir, 
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.error('\nTroubleshooting steps:');
  console.error('1. Make sure .env file exists with valid DATABASE_URL');
  console.error('2. Try running: pnpm install --force');
  console.error('3. Try running: pnpm prisma generate manually');
  process.exit(1);
}

// Verify generated client
const generatedClientPath = path.join(rootDir, 'node_modules', '.prisma', 'client');
if (!fs.existsSync(generatedClientPath)) {
  console.error('❌ Prisma client generation failed - client files not found');
  process.exit(1);
}
console.log('✅ Prisma client files verified');

console.log('🎉 Prisma setup completed successfully!\n');
