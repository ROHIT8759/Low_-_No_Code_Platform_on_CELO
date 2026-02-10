import { NextRequest, NextResponse } from 'next/server';
import { enqueueCompilation, StellarCompilationJobData } from '@/lib/queue';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/compile/stellar
 * 
 * Compile Stellar/Soroban Rust contracts to WASM
 * 
 * Request body:
 * {
 *   rustCode: string
 *   contractName: string
 *   network?: 'testnet' | 'mainnet'
 * }
 * 
 * Response:
 * {
 *   success: true
 *   jobId: string
 *   status: 'queued'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { rustCode, contractName, network = 'testnet' } = body;

    // Validate required fields
    if (!rustCode || typeof rustCode !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid rustCode field',
        },
        { status: 400 }
      );
    }

    if (!contractName || typeof contractName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid contractName field',
        },
        { status: 400 }
      );
    }

    // Validate network
    if (network !== 'testnet' && network !== 'mainnet') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid network. Must be "testnet" or "mainnet"',
        },
        { status: 400 }
      );
    }

    // Validate Rust code is not empty
    if (rustCode.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rust code cannot be empty',
        },
        { status: 400 }
      );
    }

    // Validate contract name format (alphanumeric, hyphens, underscores)
    const contractNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!contractNameRegex.test(contractName)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contract name must contain only alphanumeric characters, hyphens, and underscores',
        },
        { status: 400 }
      );
    }

    // Validate code size (max 1MB)
    const maxCodeSize = 1024 * 1024; // 1MB
    if (Buffer.byteLength(rustCode, 'utf-8') > maxCodeSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Rust code exceeds maximum size of ${maxCodeSize} bytes`,
        },
        { status: 400 }
      );
    }

    // Generate request ID for tracking
    const requestId = `stellar-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Prepare job data
    const jobData: StellarCompilationJobData = {
      type: 'compile-stellar',
      rustCode,
      contractName,
      network,
      requestId,
    };

    // Enqueue compilation job
    const jobId = await enqueueCompilation(jobData);

    // Store compilation job record in database
    if (supabase) {
      try {
        const { error } = await supabase.from('compilation_jobs').insert({
          job_id: jobId,
          contract_type: 'stellar',
          status: 'pending',
          source_code_hash: require('crypto')
            .createHash('sha256')
            .update(rustCode)
            .digest('hex'),
        });

        if (error) {
          console.error('[API] Error storing compilation job record:', error);
          // Don't fail the request - job is already queued
        }
      } catch (error) {
        console.error('[API] Error storing compilation job record:', error);
        // Don't fail the request - job is already queued
      }
    }

    // Return job ID for status polling
    return NextResponse.json(
      {
        success: true,
        jobId,
        status: 'queued',
        message: 'Stellar compilation job queued successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Stellar compilation endpoint error:', error);
    
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

/**
 * GET /api/compile/stellar
 * 
 * Returns API information
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/compile/stellar',
      method: 'POST',
      description: 'Compile Stellar/Soroban Rust contracts to WASM',
      requiredFields: ['rustCode', 'contractName'],
      optionalFields: ['network'],
      networks: ['testnet', 'mainnet'],
    },
    { status: 200 }
  );
}

