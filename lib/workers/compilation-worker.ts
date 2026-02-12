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

const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, 
  enableReadyCheck: false, 
};

async function processCompilationJob(
  job: Job<CompilationJobData>
): Promise<EVMCompilationResult | StellarCompilationResult> {
  const { type } = job.data;

  console.log(`[CompilationWorker] Processing job ${job.id} of type ${type}`);

  
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
    
    
    await updateJobStatus(job.id!, 'failed', undefined, error.message);
    
    
    throw error;
  }
}

async function processEVMCompilation(
  job: Job<EVMCompilationJobData>
): Promise<EVMCompilationResult> {
  const { solidityCode, contractName, optimizerRuns } = job.data;

  
  await job.updateProgress(10);

  
  const result = await compilationService.compileEVM(
    solidityCode,
    contractName,
    { optimizerRuns }
  );

  
  await job.updateProgress(100);

  return result;
}

async function processStellarCompilation(
  job: Job<StellarCompilationJobData>
): Promise<StellarCompilationResult> {
  const { rustCode, contractName, network } = job.data;

  
  await job.updateProgress(10);

  
  const result = await compilationService.compileStellar(
    rustCode,
    contractName,
    network
  );

  
  await job.updateProgress(100);

  return result;
}

async function updateJobStatus(
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  artifactId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    
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
      
    }
  } catch (error) {
    console.error('[CompilationWorker] Error updating job status:', error);
    
  }
}

export function createCompilationWorker(): Worker {
  const worker = new Worker('compilation', processCompilationJob, {
    connection: redisConnection,
    concurrency: 5, 
    limiter: {
      max: 10, 
      duration: 1000, 
    },
  });

  
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

export const compilationWorker = createCompilationWorker();
