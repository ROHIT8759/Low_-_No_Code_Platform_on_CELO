"use client"

import { useState, useEffect } from "react"
import { X, Loader, CheckCircle, AlertCircle, Wallet, Eye } from "lucide-react"
import { useBuilderStore } from "@/lib/store"
import { useSupabaseStore } from "@/lib/supabase-store"
import { useWallet } from "@/lib/useWallet"
import { deploymentService, STELLAR_NETWORK_CONFIG } from "@/lib/services/deployment"
import { ContractPreviewModal } from "./contract-preview-modal"
import { saveDeployedContract } from "@/lib/supabase"
import * as StellarSdk from "@stellar/stellar-sdk"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

type DeployStep = "connect" | "configure" | "deploying" | "success" | "error"

const STELLAR_NETWORKS = {
  testnet: {
    name: "Stellar Testnet",
    networkPassphrase: "Test SDF Network ; September 2015",
    horizonUrl: "https://horizon-testnet.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/testnet",
  },
  mainnet: {
    name: "Stellar Mainnet",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
    horizonUrl: "https://horizon.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/public",
  },
}

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const blocks = useBuilderStore((state) => state.blocks)
  const addDeployedContract = useBuilderStore((state) => state.addDeployedContract)
  const currentUser = useSupabaseStore((state) => state.user)
  const syncDeployedContracts = useSupabaseStore((state) => state.syncDeployedContracts)
  
  const { 
    walletAddress, 
    network: walletNetwork, 
    isConnecting, 
    isConnected, 
    isFreighterAvailable,
    connect, 
    disconnect, 
    switchNetwork,
    signTransaction 
  } = useWallet()

  const [step, setStep] = useState<DeployStep>("connect")
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")
  const [contractName, setContractName] = useState("GeneratedToken")
  const [tokenName, setTokenName] = useState("My Token")
  const [tokenSymbol, setTokenSymbol] = useState("MTK")
  const [initialSupply, setInitialSupply] = useState("1000000")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [contractId, setContractId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [deployedContractData, setDeployedContractData] = useState<any>(null)

  useEffect(() => {
    if (!isOpen) return

    if (isConnected) {
      setStep("configure")
    }

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose, isConnected])

  useEffect(() => {
    if (isConnected && walletNetwork !== network) {
      setNetwork(walletNetwork)
    }
  }, [isConnected, walletNetwork])

  const handleConnectWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isFreighterAvailable) {
        setError("Please install Freighter wallet extension to continue")
        return
      }

      await connect()
      setStep("configure")
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      setError(err.message || "Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setStep("connect")
  }

  const handleSwitchNetwork = async (targetNetwork: "testnet" | "mainnet") => {
    try {
      setLoading(true)
      await switchNetwork(targetNetwork)
      setNetwork(targetNetwork)
      setError(null)
    } catch (err: any) {
      setError(`Failed to switch network: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async () => {
    try {
      setLoading(true)
      setError(null)
      setStep("deploying")

      if (!walletAddress) {
        throw new Error("No wallet connected. Please connect your Freighter wallet.")
      }

      const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")
      if (!baseBlock) {
        throw new Error("Please add an ERC20 or NFT contract block first")
      }

      const networkConfig = STELLAR_NETWORKS[network]
      const server = new StellarSdk.Horizon.Server(networkConfig.horizonUrl)

      const account = await server.loadAccount(walletAddress)
      
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: networkConfig.networkPassphrase,
      })
        .setTimeout(30)
        .build()

      const signedXdr = await signTransaction(transaction.toXDR(), network)
      
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedXdr,
        networkConfig.networkPassphrase
      ) as StellarSdk.Transaction

      console.log("Submitting Stellar transaction...")
      const response = await server.submitTransaction(signedTransaction)
      
      console.log("Transaction submitted:", response.hash)
      setTxHash(response.hash)

      const result = await deploymentService.confirmTransaction(
        response.hash,
        `stellar-${network}`
      )

      if (!result.success) {
        throw new Error("Transaction failed on network")
      }

      const networkInfo = STELLAR_NETWORKS[network]
      const explorerUrl = `${networkInfo.explorerUrl}/tx/${response.hash}`
      
      const deployedContractInfo = {
        id: Date.now().toString(),
        contractAddress: result.contractId || response.hash,
        contractName,
        tokenName,
        tokenSymbol,
        network,
        networkType: "stellar" as const,
        networkName: networkInfo.name,
        deployer: walletAddress,
        deployedAt: new Date().toISOString(),
        transactionHash: response.hash,
        contractType: baseBlock.type as "erc20" | "nft" | "soroban",
        blocks: [...blocks],
        explorerUrl,
      }

      setContractId(result.contractId || response.hash)
      addDeployedContract(deployedContractInfo)

      if (currentUser?.id) {
        try {
          await saveDeployedContract(currentUser.id, deployedContractInfo)
          await syncDeployedContracts()
          console.log("Contract saved to Supabase")
        } catch (supabaseError) {
          console.error("Failed to save contract to Supabase:", supabaseError)
        }
      }

      setStep("success")
    } catch (err: any) {
      console.error("Deployment error:", err)

      let errorMessage = "Deployment failed"

      if (err.message?.includes("insufficient balance")) {
        errorMessage = "Insufficient XLM balance. Please fund your wallet from the Stellar Faucet."
      } else if (err.message?.includes("rejected") || err.message?.includes("cancelled")) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-semibold text-foreground">Deploy Smart Contract</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors text-muted hover:text-foreground"
            title="Close modal"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {}
          <div className="flex items-center justify-between">
            {(["connect", "configure", "deploying", "success"] as const).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step === s
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
                    className={`flex-1 h-1 mx-2 ${["success", "error"].includes(step) && i < 3 ? "bg-primary" : "bg-border"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {}
          {step === "connect" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Connect Wallet</h3>
                <p className="text-sm text-muted">Connect your Freighter wallet to deploy contracts on Stellar</p>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Stellar Networks Supported:</p>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Stellar Mainnet (Production)</li>
                  <li>• Stellar Testnet (Development)</li>
                </ul>
                <p className="text-xs text-muted mt-3">
                  Requires Freighter wallet extension for Stellar
                </p>
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
                  "Connect Freighter Wallet"
                )}
              </button>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          )}

          {}
          {step === "configure" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Configure Contract</h3>
                <p className="text-sm text-muted">Set deployment parameters</p>
              </div>

              {}
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet size={18} className="text-primary" />
                    <span className="text-sm font-semibold text-foreground">Connected Wallet</span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="text-xs text-muted hover:text-foreground transition-colors underline"
                  >
                    Disconnect
                  </button>
                </div>
                <p className="text-xs font-mono text-foreground bg-background/50 px-2 py-1 rounded">
                  {walletAddress}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted">Network:</span>
                  <span className="text-xs font-semibold text-primary">
                    {walletNetwork === "testnet" ? "Stellar Testnet" : "Stellar Mainnet"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Target Network</label>
                  <div className="flex gap-2">
                    <select
                      value={network}
                      onChange={async (e) => {
                        const newNetwork = e.target.value as "testnet" | "mainnet"
                        setNetwork(newNetwork)
                        if (walletNetwork !== newNetwork) {
                          await handleSwitchNetwork(newNetwork)
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                      title="Select deployment network"
                    >
                      <option value="testnet">Stellar Testnet (Recommended)</option>
                      <option value="mainnet">Stellar Mainnet (Production)</option>
                    </select>
                    {walletNetwork !== network && (
                      <button
                        onClick={() => handleSwitchNetwork(network)}
                        disabled={loading}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {loading ? "Switching..." : "Switch Network"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {walletNetwork === network ? (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Connected to correct network
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Please switch to {STELLAR_NETWORKS[network].name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {network === "testnet"
                      ? "🧪 Stellar Testnet - Free test XLM, perfect for development"
                      : "🌐 Stellar Mainnet - Production network, requires real XLM"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contract Name</label>
                  <input
                    type="text"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                    title="Contract Name"
                    placeholder="Enter contract name"
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
                      title="Token Name"
                      placeholder="e.g., My Token"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Symbol</label>
                    <input
                      type="text"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                      title="Token Symbol"
                      placeholder="e.g., MTK"
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
                    title="Initial Supply"
                    placeholder="e.g., 1000000"
                  />
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
                  disabled={loading || walletNetwork !== network}
                  className="flex-1 px-6 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-background rounded-lg font-semibold transition-colors"
                >
                  {loading ? "Deploying..." : "Deploy Contract"}
                </button>
              </div>
            </div>
          )}

          {}
          {step === "deploying" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader size={48} className="text-primary animate-spin" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Deploying Contract...</h3>
                <p className="text-sm text-muted">This may take a few moments</p>
              </div>
            </div>
          )}

          {}
          {step === "success" && txHash && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle size={48} className="text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Deployment Successful!</h3>
                <p className="text-sm text-muted mb-4">
                  Your contract has been deployed to {STELLAR_NETWORKS[network].name}
                </p>
              </div>

              <div className="p-4 bg-background border border-border rounded-lg space-y-3">
                {contractId && (
                  <div>
                    <p className="text-xs text-muted mb-1">Contract ID</p>
                    <p className="text-sm font-mono text-foreground break-all">{contractId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted mb-1">Transaction Hash</p>
                  <p className="text-sm font-mono text-foreground break-all">{txHash}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Network</p>
                  <p className="text-sm text-foreground">{STELLAR_NETWORKS[network].name}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")
                  setDeployedContractData({
                    contractAddress: contractId || "",
                    contractName: contractName,
                    tokenName: tokenName,
                    tokenSymbol: tokenSymbol,
                    network: network,
                    networkType: "stellar",
                    networkName: STELLAR_NETWORKS[network].name,
                    contractType: baseBlock?.type || "erc20",
                    blocks: [...blocks],
                  })
                  setShowPreview(true)
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-background rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]"
              >
                <Eye size={18} />
                Preview & Interact with Contract
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`${STELLAR_NETWORKS[network].explorerUrl}/tx/${txHash}`, "_blank")}
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

          {}
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

      {}
      {showPreview && deployedContractData && (
        <ContractPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          contract={deployedContractData}
          walletAddress={walletAddress}
        />
      )}
    </div>
  )
}
