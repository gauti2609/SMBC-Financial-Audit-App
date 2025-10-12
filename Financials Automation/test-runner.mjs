import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to load .env file
function loadEnvFile() {
  const envPath = join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found, using default environment variables');
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

async function runTests() {
  console.log('🧪 Starting Financial Reporting Feature Tests...');
  console.log('================================================');
  console.log('');
  
  // Load environment variables
  loadEnvFile();
  
  // Set NODE_ENV to development for testing
  process.env.NODE_ENV = 'development';
  
  console.log('📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not Set'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not Set'}`);
  console.log('');
  
  // Check if database URL is set
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not set. Using default PostgreSQL connection...');
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/app';
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET not set. Using default secret...');
    process.env.JWT_SECRET = 'bNreLecdncbIC1jEPdtvwm57VNM0T3iQ0qHfE7xIQyk=';
  }
  
  console.log('🚀 Running comprehensive test suite...');
  console.log('');
  
  // Run the test file using tsx
  const testProcess = spawn('npx', ['tsx', 'src/server/scripts/testAllFeatures.ts'], {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname
  });
  
  return new Promise((resolve, reject) => {
    testProcess.on('close', (code) => {
      console.log('');
      if (code === 0) {
        console.log('✅ Test execution completed successfully!');
        resolve(code);
      } else {
        console.log(`❌ Test execution failed with code ${code}`);
        reject(new Error(`Test process exited with code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('❌ Failed to start test process:', error);
      reject(error);
    });
  });
}

// Run the tests
runTests()
  .then((code) => {
    process.exit(code);
  })
  .catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
