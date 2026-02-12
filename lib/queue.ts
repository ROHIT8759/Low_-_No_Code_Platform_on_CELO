import { Queue, QueueOptions, JobsOptions } from 'bullmq';
import { RedisOptions } from 'ioredis';

const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  maxRetriesPerRequest: null, 
  enableReadyCheck: false, 
};

const defaultJobOptions: JobsOptions = {
  attempts: 3, 
  backoff: {
    type: 'exponential',
    delay: 2000, 
  },
  removeOnComplete: 100, 
  removeOnFail: 500, 
};

const queueConfig: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions,
};

export const compilationQueue = new Queue('compilation', queueConfig);

export const analysisQueue = new Queue('analysis', queueConfig);

export const deploymentQueue = new Queue('deployment', queueConfig);

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

export async function cleanQueue(
  queueName: 'compilation' | 'analysis' | 'deployment',
  grace: number = 86400000 
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

export async function closeQueues(): Promise<void> {
  await Promise.all([
    compilationQueue.close(),
    analysisQueue.close(),
    deploymentQueue.close(),
  ]);
}

export { compilationQueue as compilation, analysisQueue as analysis, deploymentQueue as deployment };
