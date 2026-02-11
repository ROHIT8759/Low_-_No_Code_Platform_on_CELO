import { Worker, Job } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { compilationService } from '../services/compilation';
import { supabase } from '../supabase';
import {
  CompilationJobData,
  EVMCompilationJobData,
  StellarCompilationJobData,
  EVMCompilationResult,
  StellarCompilationResult,
} from '../queue';

/**
 * Compilation Queue Worker
 * 
 * Processes compile-evm and compile-stellar jobs from the compilation queue.
 * Handles job execution, error handling, and database status updates.
 */

// Redis connection configuration for BullMQ worker
const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, // BullMQ recommendation
  enableReadyCheck: false, // BullMQ recommendation
};

/**
 * Process compilation job
 * 
 * @param job BullMQ job containing compilation data
 * @returns Compilation result
 */
async function processCompilationJob(
  job: Job<CompilationJobData>
): Promise<EVMCompilationResult | StellarCompilationResult> {
  const { type } = job.data;

  console.log(`[CompilationWorker] Processing job ${job.id} of type ${type}`);

  // Update job status in database to 'processing'
  await updateJobStatus(job.id!, 'processing');

  try {
    let result: EVMCompilationResult | StellarCompilationResult;

    if (type === 'compile-evm') {
      result = await processEVMCompilation(job as Job<EVMCompilationJobData>);
    } else if (type === 'compile-stellar') {
      result = await processStellarCompilation(job as Job<StellarCompilationJobData>);
    } else {
      throw new Error(`Unknown job type: ${type}`);
    }

    // Update job status based on result
    if (result.success) {
      await updateJobStatus(job.id!, 'completed', result.artifactId);
      console.log(`[CompilationWorker] Job ${job.id} completed successfully`);
    } else {
      await updateJobStatus(job.id!, 'failed', undefined, result.error || 'Compilation failed');
      console.error(`[CompilationWorker] Job ${job.id} failed:`, result.error);
    }

    return result;
  } catch (error: any) {
    console.error(`[CompilationWorker] Job ${job.id} error:`, error);
    
    // Update job status to failed
    await updateJobStatus(job.id!, 'failed', undefined, error.message);
    
    // Re-throw to let BullMQ handle retry logic
    throw error;
  }
}

/**
 * Process EVM compilation job
 * 
 * @param job EVM compilation job
 * @returns EVM compilation result
 */
async function processEVMCompilation(
  job: Job<EVMCompilationJobData>
): Promise<EVMCompilationResult> {
  const { solidityCode, contractName, optimizerRuns } = job.data;

  // Update job progress
  await job.updateProgress(10);

  // Compile the contract
  const result = await compilationService.compileEVM(
    solidityCode,
    contractName,
    { optimizerRuns }
  );

  // Update job progress
  await job.updateProgress(100);

  return result;
}

/**
 * Process Stellar compilation job
 * 
 * @param job Stellar compilation job
 * @returns Stellar compilation result
 */
async function processStellarCompilation(
  job: Job<StellarCompilationJobData>
): Promise<StellarCompilationResult> {
  const { rustCode, contractName, network } = job.data;

  // Update job progress
  await job.updateProgress(10);

  // Compile the contract
  const result = await compilationService.compileStellar(
    rustCode,
    contractName,
    network
  );

  // Update job progress
  await job.updateProgress(100);

  return result;
}

/**
 * Update compilation job status in database
 * 
 * @param jobId BullMQ job ID
 * @param status Job status
 * @param artifactId Optional artifact ID for completed jobs
 * @param errorMessage Optional error message for failed jobs
 */
async function updateJobStatus(
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  artifactId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    // Only update if Supabase is configured
    if (!supabase) {
      console.warn('[CompilationWorker] Supabase not configured - skipping status update');
      return;
    }

    const updateData: any = {
      status,
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (artifactId) {
        updateData.artifact_id = artifactId;
      }
    }

    if (status === 'failed' && errorMessage) {
      updateData.error_message = errorMessage;
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('compilation_jobs')
      .update(updateData)
      .eq('job_id', jobId);

    if (error) {
      console.error('[CompilationWorker] Error updating job status:', error);
      // Don't throw - this is a non-critical operation
    }
  } catch (error) {
    console.error('[CompilationWorker] Error updating job status:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Create and start the compilation worker
 * 
 * @returns Worker instance
 */
export function createCompilationWorker(): Worker {
  const worker = new Worker('compilation', processCompilationJob, {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // Per second
    },
  });

  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`[CompilationWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[CompilationWorker] Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('[CompilationWorker] Worker error:', err);
  });

  worker.on('ready', () => {
    console.log('[CompilationWorker] Worker ready and waiting for jobs');
  });

  return worker;
}

// Export singleton worker instance
export const compilationWorker = createCompilationWorker();
