import { NextRequest, NextResponse } from 'next/server';
import { AIIntelligenceEngine } from '@/lib/services/ai-engine';

/**
 * POST /api/analyze
 * 
 * AI-powered contract analysis endpoint
 * 
 * Request body:
 * {
 *   contractCode: string
 *   contractType: 'evm' | 'stellar'
 * }
 * 
 * Response:
 * {
 *   success: true
 *   riskScores: { [functionName]: { score, level, reasons } }
 *   gasEstimates: { [functionName]: number }
 *   uiSuggestions: { [parameter]: { fieldType, validation, placeholder } }
 *   recommendations: Array<{ type, severity, message, location }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { contractCode, contractType } = body;

    // Validate input
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

    // Currently only EVM/Solidity analysis is supported
    if (contractType !== 'evm') {
      return NextResponse.json(
        {
          error: 'Only EVM/Solidity contract analysis is currently supported',
          code: 'UNSUPPORTED_CONTRACT_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate contract code is not empty
    if (contractCode.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Contract code cannot be empty',
          code: 'EMPTY_CONTRACT',
        },
        { status: 400 }
      );
    }

    // Initialize AI engine
    const aiEngine = new AIIntelligenceEngine();

    // Perform analysis with caching
    const analysisResult = await aiEngine.analyzeContractWithCache(contractCode);

    // Return structured response
    return NextResponse.json({
      success: true,
      riskScores: analysisResult.riskScores,
      gasEstimates: analysisResult.gasEstimates,
      uiSuggestions: analysisResult.uiSuggestions,
      recommendations: analysisResult.recommendations,
    });

  } catch (error) {
    console.error('[API /analyze] Error:', error);

    // Handle parsing errors
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

    // Handle other errors
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
