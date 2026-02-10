import { NextRequest, NextResponse } from 'next/server';
import { enqueueCompilation } from '@/lib/queue';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/compile/evm
 * 
 * Compile EVM Solidity contracts
 * Enqueues compilation job for asynchronous processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { solidityCode, contractName, optimizerRuns } = body;

    // Input validation
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

    // Validate optimizer runs if provided
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

    // Generate request ID for tracking
    const requestId = uuidv4();

    // Enqueue compilation job
    const jobId = await enqueueCompilation({
      type: 'compile-evm',
      solidityCode,
      contractName,
      optimizerRuns,
      requestId,
    });

    // Return job ID for status polling
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
