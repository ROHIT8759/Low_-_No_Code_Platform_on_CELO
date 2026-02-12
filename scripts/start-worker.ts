#!/usr/bin/env node

import { compilationWorker } from '../lib/workers/compilation-worker';

console.log('[Worker] Starting compilation worker...');

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
