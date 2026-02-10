import { NextRequest, NextResponse } from "next/server"
import { compilationService } from "@/lib/services/compilation"

/**
 * POST /api/compile (Legacy endpoint)
 * 
 * Maintains backward compatibility with existing EVM compilation requests.
 * Routes to the new CompilationService for processing.
 */
export async function POST(request: NextRequest) {
  try {
    const { solidityCode, contractName, optimizerRuns } = await request.json()

    // Input validation
    if (!solidityCode || !contractName) {
      return NextResponse.json(
        { error: "Missing solidityCode or contractName" },
        { status: 400 }
      )
    }

    // Route to new EVM compilation service
    const result = await compilationService.compileEVM(
      solidityCode,
      contractName,
      { optimizerRuns }
    )

    // Handle compilation failure
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Compilation failed",
          details: result.details,
        },
        { status: 400 }
      )
    }

    // Return in legacy format (backward compatible)
    return NextResponse.json({
      success: true,
      abi: result.abi,
      bytecode: result.bytecode,
      warnings: result.warnings || [],
    })
  } catch (error: any) {
    console.error("Compilation error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
