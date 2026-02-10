import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment';

/**
 * POST /api/deploy/stellar
 * 
 * Deploy compiled Stellar/Soroban contracts to Stellar networks
 * 
 * Request body:
 * {
 *   artifactId: string
 *   network: 'testnet' | 'mainnet'
 *   sourceAccount: string
 * }
 * 
 * Response:
 * {
 *   success: true
 *   network: string
 *   envelopeXDR: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { artifactId, network, sourceAccount } = body;

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

    if (!sourceAccount || typeof sourceAccount !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid sourceAccount field',
        },
        { status: 400 }
      );
    }

    // Validate network is supported
    const supportedNetworks = ['testnet', 'mainnet'];
    if (!supportedNetworks.includes(network)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported network: ${network}`,
          details: `Supported networks: ${supportedNetworks.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create deployment service instance
    const deploymentService = new DeploymentService();

    // Call deployStellar to prepare deployment transaction
    const result = await deploymentService.deployStellar({
      artifactId,
      network: network as 'testnet' | 'mainnet',
      sourceAccount,
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

    // Return envelope XDR for client-side signing with Freighter
    return NextResponse.json(
      {
        success: true,
        network: result.network,
        envelopeXDR: result.envelopeXDR,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] Stellar deployment endpoint error:', error);
    
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
 * GET /api/deploy/stellar
 * 
 * Returns API information
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/deploy/stellar',
      method: 'POST',
      description: 'Deploy compiled Stellar/Soroban contracts to Stellar networks',
      requiredFields: ['artifactId', 'network', 'sourceAccount'],
      supportedNetworks: ['testnet', 'mainnet'],
    },
    { status: 200 }
  );
}
