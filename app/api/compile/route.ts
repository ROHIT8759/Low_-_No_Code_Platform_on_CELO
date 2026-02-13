import { NextRequest, NextResponse } from "next/server"
import { compilationService } from "@/lib/services/compilation"

export async function POST(request: NextRequest) {
  try {
    const { rustCode, contractName, network = 'testnet' } = await request.json()

    // Validate Stellar/Rust code input
    if (!rustCode || !contractName) {
      return NextResponse.json(
        { error: "Missing rustCode or contractName" },
        { status: 400 }
      )
    }

    // Reject Solidity code
    if (rustCode.includes('pragma solidity') || rustCode.includes('contract ')) {
      return NextResponse.json(
        { error: "EVM/Solidity contracts are not supported. This is a Stellar-only platform." },
        { status: 400 }
      )
    }

    // Compile as Stellar/Soroban contract
    const result = await compilationService.compileStellar(
      rustCode,
      contractName,
      network
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
      wasmHash: result.wasmHash,
      artifactId: result.artifactId,
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
