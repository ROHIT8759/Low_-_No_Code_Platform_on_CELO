"use client"

import { useState } from "react"

export default function TestCompile() {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const testCompilation = async () => {
        setLoading(true)
        setError(null)
        setResult(null)

        const testContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestToken {
    string public name;
    string public symbol;
    uint256 public totalSupply;
    
    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
    }
}`

        try {
            const response = await fetch("/api/compile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    solidityCode: testContract,
                    contractName: "TestToken",
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Compilation failed")
                setResult(data)
            } else {
                setResult(data)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-8 bg-background">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Test Solidity Compilation</h1>

                <button
                    onClick={testCompilation}
                    disabled={loading}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? "Compiling..." : "Test Compile"}
                </button>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
                        <h3 className="font-bold text-red-500 mb-2">Error:</h3>
                        <pre className="text-sm whitespace-pre-wrap">{error}</pre>
                    </div>
                )}

                {result && (
                    <div className="mt-6 space-y-4">
                        <div className="p-4 bg-card rounded-lg">
                            <h3 className="font-bold mb-2">Compilation Result:</h3>
                            {result.success ? (
                                <div className="space-y-2">
                                    <p className="text-green-500">✅ Compilation successful!</p>
                                    <div>
                                        <p className="font-semibold mt-4">Bytecode Length:</p>
                                        <p className="text-sm">{result.bytecode?.length || 0} characters</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold mt-4">ABI:</p>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                                            {JSON.stringify(result.abi, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="font-semibold mt-4">Bytecode (first 200 chars):</p>
                                        <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                            {result.bytecode?.substring(0, 200)}...
                                        </pre>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-red-500">❌ Compilation failed</p>
                                    <pre className="text-xs mt-2">{JSON.stringify(result, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
