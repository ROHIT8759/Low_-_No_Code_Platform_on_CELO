import { NextRequest, NextResponse } from 'next/server';
import { AIIntelligenceEngine } from '@/lib/services/ai-engine';

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { contractCode, contractType } = body;

    
    if (!contractCode || typeof contractCode !== 'string') {
      return NextResponse.json(
        {
          error: 'Missing or invalid contractCode field',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    if (!contractType || contractType !== 'stellar') {
      return NextResponse.json(
        {
          error: 'Missing or invalid contractType field. Must be "stellar"',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    // Validate this is Stellar/Rust code, not Solidity
    if (contractCode.includes('pragma solidity') || contractCode.includes('contract ')) {
      return NextResponse.json(
        {
          error: 'EVM/Solidity contracts are not supported. This is a Stellar-only platform.',
          code: 'UNSUPPORTED_CONTRACT_TYPE',
        },
        { status: 400 }
      );
    }

    
    if (contractCode.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Contract code cannot be empty',
          code: 'EMPTY_CONTRACT',
        },
        { status: 400 }
      );
    }

    
    const aiEngine = new AIIntelligenceEngine();

    
    const analysisResult = await aiEngine.analyzeContractWithCache(contractCode);

    
    return NextResponse.json({
      success: true,
      riskScores: analysisResult.riskScores,
      gasEstimates: analysisResult.gasEstimates,
      uiSuggestions: analysisResult.uiSuggestions,
      recommendations: analysisResult.recommendations,
    });

  } catch (error) {
    console.error('[API /analyze] Error:', error);

    
    if (error instanceof Error && error.message.includes('Failed to parse contract')) {
      return NextResponse.json(
        {
          error: 'Failed to parse contract code',
          code: 'PARSE_ERROR',
          details: error.message,
        },
        { status: 400 }
      );
    }

    
    return NextResponse.json(
      {
        error: 'Internal server error during contract analysis',
        code: 'ANALYSIS_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
