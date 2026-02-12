import { NextRequest, NextResponse } from "next/server"
import { compilationService } from "@/lib/services/compilation"

export async function POST(request: NextRequest) {
  try {
    const { solidityCode, contractName, optimizerRuns } = await request.json()

    
    if (!solidityCode || !contractName) {
      return NextResponse.json(
        { error: "Missing solidityCode or contractName" },
        { status: 400 }
      )
    }

    
    const result = await compilationService.compileEVM(
      solidityCode,
      contractName,
      { optimizerRuns }
    )

    
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Compilation failed",
          details: result.details,
        },
        { status: 400 }
      )
    }

    
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
