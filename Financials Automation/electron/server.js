"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBackendServer = startBackendServer;
exports.stopBackendServer = stopBackendServer;
exports.getServerPort = getServerPort;
const electron_1 = require("electron");
const path_1 = require("path");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
let serverProcess = null;
let serverPort = 3100;
/**
 * Start the backend server for the Electron app
 * This starts the Vinxi server that was built with the application
 */
async function startBackendServer() {
    const userDataPath = electron_1.app.getPath('userData');
    const dbPath = (0, path_1.join)(userDataPath, 'database.db');
    console.log('[Server] Starting backend server...');
    console.log('[Server] Database path:', dbPath);
    console.log('[Server] User data path:', userDataPath);
    // Check if the .output directory exists
    const outputDir = (0, path_1.join)(__dirname, '../.output');
    if (!(0, fs_1.existsSync)(outputDir)) {
        console.error('[Server] .output directory not found. Make sure to run pnpm run build first.');
        throw new Error('.output directory not found');
    }
    // Set environment variables
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = `file:${dbPath}`;
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'electron-app-secret-key-change-in-production';
    process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    process.env.PORT = serverPort.toString();
    process.env.ELECTRON_APP = 'true'; // Flag to disable MinIO
    return new Promise((resolve, reject) => {
        try {
            // Start the Vinxi server
            const serverPath = (0, path_1.join)(outputDir, 'server', 'index.mjs');
            serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
                cwd: (0, path_1.join)(__dirname, '..'),
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
        }
        catch (error) {
            console.error('[Server] Failed to start backend server:', error);
            reject(error);
        }
    });
}
/**
 * Stop the backend server
 */
function stopBackendServer() {
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
        }
        else {
            resolve();
        }
    });
}
/**
 * Get the current server port
 */
function getServerPort() {
    return serverPort;
}
