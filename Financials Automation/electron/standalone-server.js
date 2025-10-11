/**
 * Standalone tRPC server for Electron app
 * This file runs as a separate Node.js process
 */

const http = require('http');
const { createHTTPHandler } = require('@trpc/server/adapters/standalone');

// Get configuration from environment
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '3100');
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

console.log('[Standalone Server] Initializing...');
console.log('[Standalone Server] Database URL:', DATABASE_URL);
console.log('[Standalone Server] Port:', SERVER_PORT);

// Import the tRPC router
async function startServer() {
  try {
    // Import the router from the built files
    const { appRouter } = require('../dist-server/trpc/root.js');
    
    // Create HTTP handler
    const handler = createHTTPHandler({
      router: appRouter,
      createContext: () => ({}),
      onError: ({ error, path }) => {
        console.error(`[Standalone Server] tRPC error on '${path}':`, error);
      },
    });
    
    // Create HTTP server
    const server = http.createServer((req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      // Handle tRPC requests
      if (req.url.startsWith('/trpc')) {
        handler(req, res);
      } else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', port: SERVER_PORT }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    // Start listening
    server.listen(SERVER_PORT, 'localhost', () => {
      console.log(`[Standalone Server] Server started on http://localhost:${SERVER_PORT}`);
      
      // Notify parent process
      if (process.send) {
        process.send({ type: 'server-started', port: SERVER_PORT });
      }
    });
    
    server.on('error', (error) => {
      console.error('[Standalone Server] Server error:', error);
      
      // Notify parent process of error
      if (process.send) {
        process.send({ type: 'server-error', error: error.message });
      }
      
      process.exit(1);
    });
    
    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('[Standalone Server] Received SIGTERM, shutting down...');
      server.close(() => {
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('[Standalone Server] Received SIGINT, shutting down...');
      server.close(() => {
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('[Standalone Server] Failed to start:', error);
    
    // Notify parent process of error
    if (process.send) {
      process.send({ type: 'server-error', error: error.message });
    }
    
    process.exit(1);
  }
}

// Start the server
startServer();
