import { NextRequest, NextResponse } from "next/server"
import solc from "solc"

export async function POST(request: NextRequest) {
  try {
    const { solidityCode, contractName } = await request.json()

    if (!solidityCode || !contractName) {
      return NextResponse.json(
        { error: "Missing solidityCode or contractName" },
        { status: 400 }
      )
    }

    // Prepare the compiler input
    const input = {
      language: "Solidity",
      sources: {
        "contract.sol": {
          content: solidityCode,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    }

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)))

    // Check for errors
    if (output.errors) {
      const errors = output.errors.filter((error: any) => error.severity === "error")
      if (errors.length > 0) {
        return NextResponse.json(
          {
            error: "Compilation failed",
            details: errors.map((e: any) => e.formattedMessage).join("\n"),
          },
          { status: 400 }
        )
      }
    }

    // Extract the compiled contract
    const contract = output.contracts["contract.sol"][contractName]

    if (!contract) {
      return NextResponse.json(
        { error: `Contract ${contractName} not found in compiled output` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      warnings: output.errors?.filter((e: any) => e.severity === "warning") || [],
    })
  } catch (error: any) {
    console.error("Compilation error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
