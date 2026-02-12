import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment';
import { EVM_NETWORKS } from '@/lib/multi-chain/chain-config';

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { artifactId, network, constructorArgs, gasLimit } = body;

    
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

    
    if (constructorArgs !== undefined && !Array.isArray(constructorArgs)) {
      return NextResponse.json(
        {
          success: false,
          error: 'constructorArgs must be an array',
        },
        { status: 400 }
      );
    }

    
    if (gasLimit !== undefined && (typeof gasLimit !== 'number' || gasLimit <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'gasLimit must be a positive number',
        },
        { status: 400 }
      );
    }

    
    const deploymentService = new DeploymentService();

    
    const result = await deploymentService.deployEVM({
      artifactId,
      network: network as keyof typeof EVM_NETWORKS,
      constructorArgs: constructorArgs || [],
      gasLimit,
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
