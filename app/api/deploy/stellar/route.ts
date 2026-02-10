import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artifactId, network, sourceAccount } = body;
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
    const deploymentService = new DeploymentService();
    const result = await deploymentService.deployStellar({
      artifactId,
      network: network as 'testnet' | 'mainnet',
      sourceAccount,
    });
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
