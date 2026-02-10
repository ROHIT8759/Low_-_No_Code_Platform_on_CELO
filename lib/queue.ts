import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import { RedisOptions } from 'ioredis';

/**
 * BullMQ Queue System Configuration
 * 
 * Provides asynchronous job processing for:
 * - EVM contract compilation
 * - Stellar contract compilation
 * - Contract analysis
 * - Long-running operations
 */

// Redis connection configuration for BullMQ
const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, // BullMQ recommendation
  enableReadyCheck: false, // BullMQ recommendation
};

// Default job options
const defaultJobOptions: JobsOptions = {
  attempts: 3, // Retry up to 3 times
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2 second delay
  },
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 500, // Keep last 500 failed jobs for debugging
};

// Queue configuration
const queueConfig: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions,
};

/**
 * Compilation Queue
 * Handles EVM and Stellar contract compilation jobs
 */
export const compilationQueue = new Queue('compilation', queueConfig);

/**
 * Analysis Queue
 * Handles AI-powered contract analysis jobs
 */
export const analysisQueue = new Queue('analysis', queueConfig);

/**
 * Deployment Queue
 * Handles contract deployment jobs
 */
export const deploymentQueue = new Queue('deployment', queueConfig);

/**
 * Job data types
 */

export interface EVMCompilationJobData {
  type: 'compile-evm';
  solidityCode: string;
  contractName: string;
  optimizerRuns?: number;
  userId?: string;
  requestId?: string;
}

export interface StellarCompilationJobData {
  type: 'compile-stellar';
  rustCode: string;
  contractName: string;
  network: 'testnet' | 'mainnet';
  userId?: string;
  requestId?: string;
}

export interface AnalysisJobData {
  type: 'analyze-contract';
  contractCode: string;
  contractType: 'evm' | 'stellar';
  userId?: string;
  requestId?: string;
}

export interface DeploymentJobData {
  type: 'deploy-evm' | 'deploy-stellar';
  artifactId: string;
  network: string;
  constructorArgs?: any[];
  sourceAccount?: string;
  userId?: string;
  requestId?: string;
}

export type CompilationJobData = EVMCompilationJobData | StellarCompilationJobData;
export type JobData = CompilationJobData | AnalysisJobData | DeploymentJobData;

/**
 * Job result types
 */

export interface EVMCompilationResult {
  success: boolean;
  abi?: any[];
  bytecode?: string;
  warnings?: string[];
  artifactId?: string;
  error?: string;
}

export interface StellarCompilationResult {
  success: boolean;
  abi?: any;
  wasmHash?: string;
  artifactId?: string;
  warnings?: string[];
  error?: string;
}

export interface AnalysisResult {
  success: boolean;
  riskScores?: Record<string, any>;
  gasEstimates?: Record<string, number>;
  uiSuggestions?: Record<string, any>;
  recommendations?: any[];
  error?: string;
}

export interface DeploymentResult {
  success: boolean;
  contractAddress?: string;
  contractId?: string;
  txHash?: string;
  network?: string;
  gasUsed?: number;
  error?: string;
}

export type JobResult = EVMCompilationResult | StellarCompilationResult | AnalysisResult | DeploymentResult;

/**
 * Queue helper functions
 */

/**
 * Add a compilation job to the queue
 */
export async function enqueueCompilation(
  data: CompilationJobData,
  options?: JobsOptions
): Promise<string> {
  const job = await compilationQueue.add(
    data.type,
    data,
    {
      ...defaultJobOptions,
      ...options,
    }
  );
  return job.id!;
}

/**
 * Add an analysis job to the queue
 */
export async function enqueueAnalysis(
  data: AnalysisJobData,
  options?: JobsOptions
): Promise<string> {
  const job = await analysisQueue.add(
    data.type,
    data,
    {
      ...defaultJobOptions,
      ...options,
    }
  );
  return job.id!;
}

/**
 * Add a deployment job to the queue
 */
export async function enqueueDeployment(
  data: DeploymentJobData,
  options?: JobsOptions
): Promise<string> {
  const job = await deploymentQueue.add(
    data.type,
    data,
    {
      ...defaultJobOptions,
      ...options,
    }
  );
  return job.id!;
}

/**
 * Get job status and result
 */
export async function getJobStatus(
  queueName: 'compilation' | 'analysis' | 'deployment',
  jobId: string
): Promise<{
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
  progress?: number;
  result?: JobResult;
  error?: string;
}> {
  try {
    const queue = queueName === 'compilation' 
      ? compilationQueue 
      : queueName === 'analysis'
      ? analysisQueue
      : deploymentQueue;

    const job = await queue.getJob(jobId);

    if (!job) {
      return { status: 'unknown' };
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const error = job.failedReason;

    return {
      status: state as any,
      progress: typeof progress === 'number' ? progress : undefined,
      result,
      error,
    };
  } catch (error) {
    console.error(`[Queue] Error getting job status for ${jobId}:`, error);
    return { status: 'unknown' };
  }
}

/**
 * Remove a job from the queue
 */
export async function removeJob(
  queueName: 'compilation' | 'analysis' | 'deployment',
  jobId: string
): Promise<boolean> {
  try {
    const queue = queueName === 'compilation' 
      ? compilationQueue 
      : queueName === 'analysis'
      ? analysisQueue
      : deploymentQueue;

    const job = await queue.getJob(jobId);
    
    if (job) {
      await job.remove();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`[Queue] Error removing job ${jobId}:`, error);
    return false;
  }
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics(
  queueName: 'compilation' | 'analysis' | 'deployment'
): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  try {
    const queue = queueName === 'compilation' 
      ? compilationQueue 
      : queueName === 'analysis'
      ? analysisQueue
      : deploymentQueue;

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  } catch (error) {
    console.error(`[Queue] Error getting metrics for ${queueName}:`, error);
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
}

/**
 * Clean old jobs from queue
 */
export async function cleanQueue(
  queueName: 'compilation' | 'analysis' | 'deployment',
  grace: number = 86400000 // 24 hours in milliseconds
): Promise<void> {
  try {
    const queue = queueName === 'compilation' 
      ? compilationQueue 
      : queueName === 'analysis'
      ? analysisQueue
      : deploymentQueue;

    await queue.clean(grace, 100, 'completed');
    await queue.clean(grace, 100, 'failed');
  } catch (error) {
    console.error(`[Queue] Error cleaning queue ${queueName}:`, error);
  }
}

/**
 * Close all queue connections
 */
export async function closeQueues(): Promise<void> {
  await Promise.all([
    compilationQueue.close(),
    analysisQueue.close(),
    deploymentQueue.close(),
  ]);
}

// Export queue instances
export { compilationQueue as compilation, analysisQueue as analysis, deploymentQueue as deployment };
