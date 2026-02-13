import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/lib/queue';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        {
          error: 'Job ID is required',
          code: 'MISSING_JOB_ID',
        },
        { status: 400 }
      );
    }

    
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

    
    if (!jobRecord) {
      
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

      
      return NextResponse.json(
        {
          error: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    
    const bullmqStatus = await getJobStatus('compilation', jobId);

    
    const response: any = {
      success: true,
      jobId,
      status: jobRecord.status,
      contractType: jobRecord.contract_type,
      createdAt: jobRecord.created_at,
      completedAt: jobRecord.completed_at,
    };

    
    if (bullmqStatus.status !== 'unknown' && bullmqStatus.progress !== undefined) {
      response.progress = bullmqStatus.progress;
    } else {
      
      response.progress = getProgressFromStatus(jobRecord.status);
    }

    
    if (jobRecord.status === 'completed' && jobRecord.artifact_id) {
      response.artifactId = jobRecord.artifact_id;
      
      
      if (bullmqStatus.result) {
        response.result = bullmqStatus.result;
      }
    }

    
    if (jobRecord.status === 'failed') {
      response.error = jobRecord.error_message || 'Job failed';
      
      
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
