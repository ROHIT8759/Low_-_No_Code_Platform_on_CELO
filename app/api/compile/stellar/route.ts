import { NextRequest, NextResponse } from 'next/server';
import { enqueueCompilation, CompilationJobData } from '@/lib/queue';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { rustCode, contractName, network = 'testnet' } = body;

    
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

    
    if (network !== 'testnet' && network !== 'mainnet') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid network. Must be "testnet" or "mainnet"',
        },
        { status: 400 }
      );
    }

    
    if (rustCode.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rust code cannot be empty',
        },
        { status: 400 }
      );
    }

    
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

    
    const maxCodeSize = 1024 * 1024; 
    if (Buffer.byteLength(rustCode, 'utf-8') > maxCodeSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Rust code exceeds maximum size of ${maxCodeSize} bytes`,
        },
        { status: 400 }
      );
    }

    
    const requestId = `stellar-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    
    const jobData: CompilationJobData = {
      type: 'compile',
      rustCode,
      contractName,
      network,
      requestId,
    };

    
    const jobId = await enqueueCompilation(jobData);

    
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
          
        }
      } catch (error) {
        console.error('[API] Error storing compilation job record:', error);
        
      }
    }

    
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

