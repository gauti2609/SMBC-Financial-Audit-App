import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running Virtual Windows Deployment Test Pipeline');
console.log('==================================================');
console.log('');
console.log('This will execute the complete deployment pipeline:');
console.log('  Phase 1: Development Verification (Diagnostic Tests)');
console.log('  Phase 2: Feature Testing (Comprehensive Test Suite)');
console.log('  Phase 3: Production Preparation (Environment Analysis)');
console.log('');

// Execute the deployment script
const deploymentProcess = spawn('node', ['deployment-script.mjs'], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

deploymentProcess.on('close', (code) => {
  console.log('');
  console.log('='.repeat(60));
  if (code === 0) {
    console.log('✅ DEPLOYMENT PIPELINE COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('🎯 All phases passed:');
    console.log('  ✅ Development verification');
    console.log('  ✅ Feature testing');
    console.log('  ✅ Production preparation');
    console.log('');
    console.log('🏗️  Ready for Windows .exe generation!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('  1. Run: pnpm run build:electron');
    console.log('  2. Run: pnpm run electron:dist:win');
    console.log('  3. Test the generated .exe installer');
    console.log('  4. Deploy to target Windows machines');
  } else {
    console.log('❌ DEPLOYMENT PIPELINE FAILED');
    console.log('');
    console.log('Please review the errors above and address any issues before proceeding.');
    console.log('Common issues to check:');
    console.log('  • Environment variables properly set');
    console.log('  • All dependencies installed');
    console.log('  • Database connectivity');
    console.log('  • TypeScript compilation');
  }
  console.log('='.repeat(60));
  process.exit(code);
});

deploymentProcess.on('error', (error) => {
  console.error('❌ Failed to start deployment pipeline:', error);
  process.exit(1);
});
