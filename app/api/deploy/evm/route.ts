import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment';
import { EVM_NETWORKS } from '@/lib/multi-chain/chain-config';

/**
 * POST /api/deploy/evm
 * 
 * Deploy compiled EVM contracts to supported networks
 * 
 * Request body:
 * {
 *   artifactId: string
 *   network: string (e.g., 'celo', 'ethereum', 'polygon')
 *   constructorArgs?: any[]
 *   gasLimit?: number
 * }
 * 
 * Response:
 * {
 *   success: true
 *   network: string
 *   unsignedTransaction: {
 *     data: string
 *     chainId: number
 *     gasLimit: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { artifactId, network, constructorArgs, gasLimit } = body;

    // Validate required fields
    if (!artifactId || typeof artifactId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid artifactId field',
        },
        { status: 400 }
      );
    }

    if (!network || typeof network !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid network field',
        },
        { status: 400 }
      );
    }

    // Validate network is supported
    if (!(network in EVM_NETWORKS)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported network: ${network}`,
          details: `Supported networks: ${Object.keys(EVM_NETWORKS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate constructorArgs if provided
    if (constructorArgs !== undefined && !Array.isArray(constructorArgs)) {
      return NextResponse.json(
        {
          success: false,
          error: 'constructorArgs must be an array',
        },
        { status: 400 }
      );
    }

    // Validate gasLimit if provided
    if (gasLimit !== undefined && (typeof gasLimit !== 'number' || gasLimit <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'gasLimit must be a positive number',
        },
        { status: 400 }
      );
    }

    // Create deployment service instance
    const deploymentService = new DeploymentService();

    // Call deployEVM to prepare deployment transaction
    const result = await deploymentService.deployEVM({
      artifactId,
      network: network as keyof typeof EVM_NETWORKS,
      constructorArgs: constructorArgs || [],
      gasLimit,
    });

    // Check if deployment preparation was successful
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Deployment preparation failed',
          details: result.details,
        },
        { status: 400 }
      );
    }

    // Return unsigned transaction for client-side signing
    return NextResponse.json(
      {
        success: true,
        network: result.network,
        unsignedTransaction: result.unsignedTransaction,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] EVM deployment endpoint error:', error);
    
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
 * GET /api/deploy/evm
 * 
 * Returns API information
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/deploy/evm',
      method: 'POST',
      description: 'Deploy compiled EVM contracts to supported networks',
      requiredFields: ['artifactId', 'network'],
      optionalFields: ['constructorArgs', 'gasLimit'],
      supportedNetworks: Object.keys(EVM_NETWORKS),
    },
    { status: 200 }
  );
}
