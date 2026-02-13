import { Worker, Job } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { compilationService } from '../services/compilation';
import { supabase } from '../supabase';
import {
  CompilationJobData,
  CompilationResult,
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
): Promise<CompilationResult> {
  await job.updateProgress(10);
  await updateJobStatus(job.id!, 'processing');

  try {
    const result = await compilationService.compileStellar(
      job.data.rustCode,
      job.data.contractName,
      job.data.network
    );

    if (result.success) {
      await updateJobStatus(job.id!, 'completed', result.artifactId);
    } else {
      await updateJobStatus(job.id!, 'failed', undefined, result.error || 'Compilation failed');
    }

    await job.updateProgress(100);
    return result;
  } catch (error: any) {
    await updateJobStatus(job.id!, 'failed', undefined, error.message);
    throw error;
  }
}

async function updateJobStatus(
  jobId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  artifactId?: string,
  errorMessage?: string
): Promise<void> {
  try {
    if (!supabase) return;

    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (artifactId) updateData.artifact_id = artifactId;
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
      // Silent fail - don't block compilation
    }
  } catch (error) {
    // Silent fail
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
    // Job completed
  });

  worker.on('failed', (job, err) => {
    // Job failed - logged elsewhere
  });

  worker.on('error', (err) => {
    // Worker error
  });

  worker.on('ready', () => {
    // Worker ready
  });

  return worker;
}

export const compilationWorker = createCompilationWorker();
