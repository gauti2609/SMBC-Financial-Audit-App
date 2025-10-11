import { app } from 'electron';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';

let serverProcess: ChildProcess | null = null;
let serverPort: number = 3100;

/**
 * Start the backend server for the Electron app
 * This starts the Vinxi server that was built with the application
 */
export async function startBackendServer(): Promise<number> {
  const userDataPath = app.getPath('userData');
  const dbPath = join(userDataPath, 'database.db');
  
  console.log('[Server] Starting backend server...');
  console.log('[Server] Database path:', dbPath);
  console.log('[Server] User data path:', userDataPath);
  
  // Check if the .output directory exists
  const outputDir = join(__dirname, '../.output');
  if (!existsSync(outputDir)) {
    console.error('[Server] .output directory not found. Make sure to run pnpm run build first.');
    throw new Error('.output directory not found');
  }
  
  // Set environment variables
  process.env.NODE_ENV = 'production';
  process.env.DATABASE_URL = `file:${dbPath}`;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'electron-app-secret-key-change-in-production';
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  process.env.PORT = serverPort.toString();
  
  return new Promise((resolve, reject) => {
    try {
      // Start the Vinxi server
      const serverPath = join(outputDir, 'server', 'index.mjs');
      
      serverProcess = spawn('node', [serverPath], {
        cwd: join(__dirname, '..'),
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      let serverStarted = false;
      
      // Capture server output
      serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('[Server]', output);
        
        // Check if server started successfully
        if (!serverStarted && (output.includes('listening') || output.includes('started'))) {
          serverStarted = true;
          console.log(`[Server] Backend server started on port ${serverPort}`);
          resolve(serverPort);
        }
      });
      
      serverProcess.stderr?.on('data', (data) => {
        console.error('[Server Error]', data.toString());
      });
      
      serverProcess.on('error', (error) => {
        console.error('[Server] Failed to start server process:', error);
        reject(error);
      });
      
      serverProcess.on('exit', (code) => {
        if (code !== 0 && !serverStarted) {
          console.error(`[Server] Server process exited with code ${code}`);
          reject(new Error(`Server process exited with code ${code}`));
        }
        serverProcess = null;
      });
      
      // Timeout if server doesn't start in 10 seconds
      setTimeout(() => {
        if (!serverStarted) {
          console.log('[Server] Assuming server started (timeout reached)');
          resolve(serverPort);
        }
      }, 5000);
    } catch (error) {
      console.error('[Server] Failed to start backend server:', error);
      reject(error);
    }
  });
}

/**
 * Stop the backend server
 */
export function stopBackendServer(): Promise<void> {
  return new Promise((resolve) => {
    if (serverProcess) {
      serverProcess.once('exit', () => {
        console.log('[Server] Backend server stopped');
        serverProcess = null;
        resolve();
      });
      serverProcess.kill();
      
      // Force kill after 5 seconds if process doesn't exit
      setTimeout(() => {
        if (serverProcess) {
          serverProcess.kill('SIGKILL');
          serverProcess = null;
          resolve();
        }
      }, 5000);
    } else {
      resolve();
    }
  });
}

/**
 * Get the current server port
 */
export function getServerPort(): number {
  return serverPort;
}


/**
 * Stop the backend server
 */
export function stopBackendServer(): Promise<void> {
  return new Promise((resolve) => {
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('[Server] Backend server stopped');
        serverInstance = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Get the current server port
 */
export function getServerPort(): number {
  return serverPort;
}
