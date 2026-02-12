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

    if (!contractType || !['evm', 'stellar'].includes(contractType)) {
      return NextResponse.json(
        {
          error: 'Missing or invalid contractType field. Must be "evm" or "stellar"',
          code: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    
    if (contractType !== 'evm') {
      return NextResponse.json(
        {
          error: 'Only EVM/Solidity contract analysis is currently supported',
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
