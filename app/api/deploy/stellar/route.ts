import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { DeploymentService } from '@/lib/services/deployment';
import { deploymentLogger as logger } from '@/lib/logger';
import { withCSRFProtection } from '@/lib/middleware/csrf';

const StellarDeploySchema = z.object({
  artifactId: z.string().min(1, 'Artifact ID is required'),
  network: z.enum(['testnet', 'mainnet'], {
    errorMap: () => ({ message: 'Network must be testnet or mainnet' }),
  }),
  sourceAccount: z.string().min(1, 'Source account is required'),
});

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = StellarDeploySchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: issues,
        },
        { status: 400 }
      );
    }

    const { artifactId, network, sourceAccount } = validation.data;
    
    const deploymentService = new DeploymentService();
    const result = await deploymentService.deployStellar({
      artifactId,
      network,
      sourceAccount,
    });

    if (!result.success) {
      logger.error('Stellar deployment failed', undefined, { 
        artifactId, 
        network, 
        error: result.error 
      });
      
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Deployment preparation failed',
          details: result.details,
        },
        { status: 400 }
      );
    }

    logger.info('Stellar deployment prepared', { 
      artifactId, 
      network,
      hasEnvelope: !!result.envelopeXDR 
    });

    return NextResponse.json(
      {
        success: true,
        network: result.network,
        envelopeXDR: result.envelopeXDR,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Stellar deployment endpoint error', error);
    
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

export const POST = withCSRFProtection(handlePost);
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
