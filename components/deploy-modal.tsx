"use client"

import { useState } from "react"
import { X, Loader, CheckCircle, AlertCircle } from "lucide-react"
import { generateSolidityCode } from "@/lib/code-generator"
import { useBuilderStore } from "@/lib/store"
import { CELO_NETWORKS, getExplorerUrl } from "@/lib/celo-config"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

type DeployStep = "connect" | "configure" | "deploying" | "success" | "error"

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const blocks = useBuilderStore((state) => state.blocks)
  const [step, setStep] = useState<DeployStep>("connect")
  const [network, setNetwork] = useState<"alfajores" | "mainnet">("alfajores")
  const [contractName, setContractName] = useState("GeneratedToken")
  const [tokenName, setTokenName] = useState("My Token")
  const [tokenSymbol, setTokenSymbol] = useState("MTK")
  const [initialSupply, setInitialSupply] = useState("1000000")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConnectWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if MetaMask/Celo wallet is available
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        setWalletAddress(accounts[0])
        setStep("configure")
      } else {
        setError("Please install MetaMask or Celo Wallet extension")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async () => {
    try {
      setLoading(true)
      setError(null)
      setStep("deploying")

      // Simulate deployment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock transaction hash
      const mockTxHash = "0x" + Math.random().toString(16).slice(2)
      setTxHash(mockTxHash)
      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const solidityCode = generateSolidityCode(blocks)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-semibold text-foreground">Deploy Smart Contract</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            {(["connect", "configure", "deploying", "success"] as const).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step === s
                      ? "bg-primary text-background"
                      : ["success", "error"].includes(step) && i < 3
                        ? "bg-primary text-background"
                        : "bg-border text-muted"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ["success", "error"].includes(step) && i < 3 ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Connect Wallet Step */}
          {step === "connect" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Connect Wallet</h3>
                <p className="text-sm text-muted">Connect your wallet to deploy the contract to Celo network</p>
              </div>

              <div className="p-4 bg-background border border-border rounded-lg">
                <p className="text-sm text-muted mb-3">Supported wallets:</p>
                <ul className="text-sm text-muted space-y-1">
                  <li>• MetaMask</li>
                  <li>• Celo Wallet</li>
                  <li>• WalletConnect</li>
                </ul>
              </div>

              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-background rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            </div>
          )}

          {/* Configure Step */}
          {step === "configure" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Configure Contract</h3>
                <p className="text-sm text-muted">Set deployment parameters</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as "alfajores" | "mainnet")}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="alfajores">Alfajores Testnet (Recommended)</option>
                    <option value="mainnet">Celo Mainnet</option>
                  </select>
                  <p className="text-xs text-muted mt-1">
                    {network === "alfajores"
                      ? "Test network - no real funds required"
                      : "Production network - requires real CELO"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contract Name</label>
                  <input
                    type="text"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Token Name</label>
                    <input
                      type="text"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Symbol</label>
                    <input
                      type="text"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Initial Supply</label>
                  <input
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="p-4 bg-background border border-border rounded-lg">
                  <p className="text-xs font-mono text-muted-foreground overflow-x-auto">
                    {solidityCode.split("\n").slice(0, 5).join("\n")}...
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("connect")}
                  className="flex-1 px-6 py-2 bg-background border border-border hover:bg-border rounded-lg font-semibold transition-colors text-foreground"
                >
                  Back
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-background rounded-lg font-semibold transition-colors"
                >
                  {loading ? "Deploying..." : "Deploy Contract"}
                </button>
              </div>
            </div>
          )}

          {/* Deploying Step */}
          {step === "deploying" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader size={48} className="text-primary animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Deploying Contract...</h3>
                <p className="text-sm text-muted">This may take a few moments</p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && txHash && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle size={48} className="text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Deployment Successful!</h3>
                <p className="text-sm text-muted mb-4">
                  Your contract has been deployed to {CELO_NETWORKS[network].name}
                </p>
              </div>

              <div className="p-4 bg-background border border-border rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-muted mb-1">Transaction Hash</p>
                  <p className="text-sm font-mono text-foreground break-all">{txHash}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Network</p>
                  <p className="text-sm text-foreground">{CELO_NETWORKS[network].name}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open(getExplorerUrl(txHash, network), "_blank")}
                  className="flex-1 px-6 py-2 bg-background border border-border hover:bg-border rounded-lg font-semibold transition-colors text-foreground"
                >
                  View on Explorer
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-2 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === "error" && error && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <AlertCircle size={48} className="text-destructive" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Deployment Failed</h3>
                <p className="text-sm text-muted">{error}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("configure")}
                  className="flex-1 px-6 py-2 bg-background border border-border hover:bg-border rounded-lg font-semibold transition-colors text-foreground"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-2 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
