import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/jobs/[jobId]
 * 
 * Query job status, progress, and results
 * 
 * Returns:
 * - Job status (pending, processing, completed, failed)
 * - Progress percentage (0-100)
 * - Results (artifact_id, contract details)
 * - Error messages if failed
 * 
 * Validates: Requirements 8.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        {
          error: 'Job ID is required',
          code: 'MISSING_JOB_ID',
        },
        { status: 400 }
      );
    }

    // Query database for job record
    if (!supabase) {
      return NextResponse.json(
        {
          error: 'Database not configured',
          code: 'DATABASE_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const { data: jobRecord, error: dbError } = await supabase
      .from('compilation_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      console.error('[JobStatus] Database error:', dbError);
      return NextResponse.json(
        {
          error: 'Failed to query job status',
          code: 'DATABASE_ERROR',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // If no database record, check BullMQ directly
    if (!jobRecord) {
      // Try to find the job in any of the queues
      const queueTypes = ['compilation', 'analysis', 'deployment'] as const;
      
      for (const queueType of queueTypes) {
        const bullmqStatus = await getJobStatus(queueType, jobId);
        
        if (bullmqStatus.status !== 'unknown') {
          return NextResponse.json({
            success: true,
            jobId,
            status: mapBullMQStatus(bullmqStatus.status),
            progress: bullmqStatus.progress || 0,
            result: bullmqStatus.result || null,
            error: bullmqStatus.error || null,
            source: 'queue',
          });
        }
      }

      // Job not found in any queue or database
      return NextResponse.json(
        {
          error: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Job found in database - get additional details from BullMQ
    const bullmqStatus = await getJobStatus('compilation', jobId);

    // Prepare response
    const response: any = {
      success: true,
      jobId,
      status: jobRecord.status,
      contractType: jobRecord.contract_type,
      createdAt: jobRecord.created_at,
      completedAt: jobRecord.completed_at,
    };

    // Add progress from BullMQ if available
    if (bullmqStatus.status !== 'unknown' && bullmqStatus.progress !== undefined) {
      response.progress = bullmqStatus.progress;
    } else {
      // Estimate progress based on status
      response.progress = getProgressFromStatus(jobRecord.status);
    }

    // Add results if completed
    if (jobRecord.status === 'completed' && jobRecord.artifact_id) {
      response.artifactId = jobRecord.artifact_id;
      
      // Get result from BullMQ if available
      if (bullmqStatus.result) {
        response.result = bullmqStatus.result;
      }
    }

    // Add error if failed
    if (jobRecord.status === 'failed') {
      response.error = jobRecord.error_message || 'Job failed';
      
      // Get additional error details from BullMQ if available
      if (bullmqStatus.error) {
        response.errorDetails = bullmqStatus.error;
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[JobStatus] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Map BullMQ status to our standard status format
 */
function mapBullMQStatus(
  bullmqStatus: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown'
): 'pending' | 'processing' | 'completed' | 'failed' {
  switch (bullmqStatus) {
    case 'waiting':
    case 'delayed':
      return 'pending';
    case 'active':
      return 'processing';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
}

/**
 * Estimate progress percentage based on job status
 */
function getProgressFromStatus(status: string): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'processing':
      return 50;
    case 'completed':
      return 100;
    case 'failed':
      return 0;
    default:
      return 0;
  }
}
