import { NextRequest, NextResponse } from 'next/server';
import { enqueueCompilation } from '@/lib/queue';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solidityCode, contractName, optimizerRuns } = body;

    
    if (!solidityCode || typeof solidityCode !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid solidityCode',
        },
        { status: 400 }
      );
    }

    if (!contractName || typeof contractName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid contractName',
        },
        { status: 400 }
      );
    }

    
    if (optimizerRuns !== undefined) {
      if (typeof optimizerRuns !== 'number' || optimizerRuns < 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid optimizerRuns - must be a positive number',
          },
          { status: 400 }
        );
      }
    }

    
    const requestId = uuidv4();

    
    const jobId = await enqueueCompilation({
      type: 'compile-evm',
      solidityCode,
      contractName,
      optimizerRuns,
      requestId,
    });

    
    return NextResponse.json({
      success: true,
      jobId,
      requestId,
      message: 'Compilation job enqueued',
      statusUrl: `/api/jobs/${jobId}`,
    });
  } catch (error: any) {
    console.error('[API] /api/compile/evm error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
