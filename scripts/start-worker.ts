#!/usr/bin/env node

/**
 * Worker Process Starter
 * 
 * Starts the compilation queue worker process.
 * This should be run as a separate process from the Next.js server.
 * 
 * Usage:
 *   npm run worker
 *   or
 *   node --loader ts-node/esm scripts/start-worker.ts
 */

import { compilationWorker } from '../lib/workers/compilation-worker';

console.log('[Worker] Starting compilation worker...');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, shutting down gracefully...');
  await compilationWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, shutting down gracefully...');
  await compilationWorker.close();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Worker] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Worker] Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('[Worker] Compilation worker started successfully');
console.log('[Worker] Press Ctrl+C to stop');
