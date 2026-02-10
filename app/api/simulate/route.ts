import { NextRequest, NextResponse } from 'next/server';
import { simulationService } from '@/lib/services/simulation';

/**
 * POST /api/simulate
 * 
 * Simulate contract execution before deployment
 * 
 * Supports both EVM and Stellar contract types. Simulations allow developers
 * to verify behavior and estimate costs without spending real funds.
 * 
 * Request body:
 * {
 *   contractType: 'evm' | 'stellar'
 *   contractAddress?: string
 *   contractCode?: string
 *   functionName: string
 *   args: any[]
 *   network: string
 *   accountState?: {
 *     address: string
 *     balance?: string
 *   }
 * }
 * 
 * Response:
 * {
 *   success: true
 *   result: any
 *   gasEstimate: number
 *   stateChanges: Array<StateChange>
 *   logs: Array<Log>
 * }
 * 
 * Requirements: 4.1, 4.4, 4.5, 4.6, 4.7
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      contractType,
      contractAddress,
      contractCode,
      functionName,
      args,
      network,
      accountState,
    } = body;

    // Validate required fields
    if (!contractType || typeof contractType !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid contractType field',
          details: 'contractType must be "evm" or "stellar"',
        },
        { status: 400 }
      );
    }

    // Validate contract type
    if (!['evm', 'stellar'].includes(contractType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contractType',
          details: 'contractType must be "evm" or "stellar"',
        },
        { status: 400 }
      );
    }

    // Validate function name
    if (!functionName || typeof functionName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid functionName field',
        },
        { status: 400 }
      );
    }

    // Validate args
    if (!args || !Array.isArray(args)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid args field',
          details: 'args must be an array',
        },
        { status: 400 }
      );
    }

    // Validate network
    if (!network || typeof network !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid network field',
        },
        { status: 400 }
      );
    }

    // Validate that either contractAddress or contractCode is provided
    if (!contractAddress && !contractCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing contract information',
          details: 'Either contractAddress or contractCode must be provided',
        },
        { status: 400 }
      );
    }

    // Validate contractAddress if provided
    if (contractAddress && typeof contractAddress !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contractAddress field',
          details: 'contractAddress must be a string',
        },
        { status: 400 }
      );
    }

    // Validate contractCode if provided
    if (contractCode && typeof contractCode !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contractCode field',
          details: 'contractCode must be a string',
        },
        { status: 400 }
      );
    }

    // Validate accountState if provided
    if (accountState !== undefined) {
      if (typeof accountState !== 'object' || accountState === null) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid accountState field',
            details: 'accountState must be an object with address and optional balance',
          },
          { status: 400 }
        );
      }

      if (!accountState.address || typeof accountState.address !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid accountState.address field',
            details: 'accountState.address must be a string',
          },
          { status: 400 }
        );
      }

      if (accountState.balance !== undefined && typeof accountState.balance !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid accountState.balance field',
            details: 'accountState.balance must be a string',
          },
          { status: 400 }
        );
      }
    }

    // Call simulation service
    const result = await simulationService.simulate({
      contractType: contractType as 'evm' | 'stellar',
      contractAddress,
      contractCode,
      functionName,
      args,
      network,
      accountState,
    });

    // Check if simulation was successful
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Simulation failed',
          details: result.details,
          revertReason: result.revertReason,
        },
        { status: 400 }
      );
    }

    // Return simulation results
    return NextResponse.json(
      {
        success: true,
        result: result.result,
        gasEstimate: result.gasEstimate,
        stateChanges: result.stateChanges || [],
        logs: result.logs || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Simulation endpoint error:', error);
    
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
 * GET /api/simulate
 * 
 * Returns API information
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/simulate',
      method: 'POST',
      description: 'Simulate contract execution before deployment for both EVM and Stellar contracts',
      requiredFields: ['contractType', 'functionName', 'args', 'network'],
      optionalFields: ['contractAddress', 'contractCode', 'accountState'],
      contractTypes: ['evm', 'stellar'],
      notes: [
        'Either contractAddress or contractCode must be provided',
        'For EVM: network can be "celo", "celo-testnet", etc.',
        'For Stellar: network should be "testnet" or "mainnet"',
        'Gas estimates are in gas units for EVM and Stroops for Stellar',
        'accountState allows simulation with different account balances',
      ],
    },
    { status: 200 }
  );
}
