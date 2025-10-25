"use client"

import { useState, useEffect } from "react"
import { X, Loader, CheckCircle, AlertCircle, Wallet } from "lucide-react"
import { generateSolidityCode } from "@/lib/code-generator"
import { useBuilderStore } from "@/lib/store"
import { CELO_NETWORKS, getExplorerUrl } from "@/lib/celo-config"
import { ethers } from "ethers"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

type DeployStep = "connect" | "configure" | "deploying" | "success" | "error"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const blocks = useBuilderStore((state) => state.blocks)
  const [step, setStep] = useState<DeployStep>("connect")
  const [network, setNetwork] = useState<"sepolia" | "mainnet">("sepolia")
  const [contractName, setContractName] = useState("GeneratedToken")
  const [tokenName, setTokenName] = useState("My Token")
  const [tokenSymbol, setTokenSymbol] = useState("MTK")
  const [initialSupply, setInitialSupply] = useState("1000000")
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [currentChainId, setCurrentChainId] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Check if wallet is already connected
    checkWalletConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    // Handle ESC key press to close modal
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen, onClose])

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setWalletAddress(address)
          setProvider(provider)

          // Get current chain ID
          const network = await provider.getNetwork()
          setCurrentChainId(Number(network.chainId))

          setStep("configure")
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWalletAddress(null)
      setProvider(null)
      setStep("connect")
    } else {
      setWalletAddress(accounts[0])
    }
  }

  const handleChainChanged = (chainIdHex: string) => {
    const chainId = parseInt(chainIdHex, 16)
    setCurrentChainId(chainId)
    // Reload the page to reset state when chain changes
    window.location.reload()
  }

  const addCeloNetwork = async (networkType: "sepolia" | "mainnet") => {
    const networkConfig = CELO_NETWORKS[networkType]

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${networkConfig.chainId.toString(16)}`,
            chainName: networkConfig.name,
            nativeCurrency: {
              name: "CELO",
              symbol: "CELO",
              decimals: 18,
            },
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.explorerUrl],
          },
        ],
      })
      return true
    } catch (err) {
      console.error("Error adding network:", err)
      throw err
    }
  }

  const switchNetwork = async (networkType: "sepolia" | "mainnet") => {
    const networkConfig = CELO_NETWORKS[networkType]

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
      })
      setCurrentChainId(networkConfig.chainId)
      return true
    } catch (err: any) {
      // Error code 4902 means the chain hasn't been added yet
      if (err.code === 4902) {
        return await addCeloNetwork(networkType)
      }
      throw err
    }
  }

  const handleConnectWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if a Celo-compatible wallet is available
      if (!window.ethereum) {
        setError("Please install a Celo-compatible wallet extension to continue")
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        setError("No accounts found. Please unlock your wallet.")
        return
      }

      // Create provider
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      // Get signer and address
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddress(address)

      // Get current network
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      setCurrentChainId(chainId)

      // Check if we're on the correct network
      const targetChainId = CELO_NETWORKS.sepolia.chainId
      if (chainId !== targetChainId) {
        // Try to switch to Sepolia
        try {
          await switchNetwork("sepolia")
        } catch (switchErr) {
          setError("Please switch to Celo Sepolia Testnet in your wallet")
          return
        }
      }

      setStep("configure")
    } catch (err: any) {
      console.error("Wallet connection error:", err)
      if (err.code === 4001) {
        setError("Connection request rejected. Please approve the connection in your wallet.")
      } else {
        setError(err.message || "Failed to connect wallet")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    setWalletAddress(null)
    setProvider(null)
    setCurrentChainId(null)
    setStep("connect")
  }

  const handleDeploy = async () => {
    try {
      setLoading(true)
      setError(null)
      setStep("deploying")

      if (!provider || !walletAddress) {
        throw new Error("Wallet not connected")
      }

      // Check if on correct network
      if (currentChainId !== CELO_NETWORKS[network].chainId) {
        throw new Error(`Please switch to ${CELO_NETWORKS[network].name}`)
      }

      // Get the signer
      const signer = await provider.getSigner()

      // Generate the Solidity code with user parameters
      const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")
      if (!baseBlock) {
        throw new Error("Please add an ERC20 or NFT contract block first")
      }

      // Generate Solidity code
      const solidityCode = generateSolidityCode(blocks)

      // Extract contract name from the code
      const contractNameMatch = solidityCode.match(/contract\s+(\w+)/)
      const contractName = contractNameMatch ? contractNameMatch[1] : "MyToken"

      console.log("Step 1: Compiling contract...")
      console.log("Contract Name:", contractName)

      // Step 1: Compile the contract via API
      const compileResponse = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solidityCode,
          contractName,
        }),
      })

      if (!compileResponse.ok) {
        const errorData = await compileResponse.json()
        throw new Error(errorData.details || errorData.error || "Compilation failed")
      }

      const { abi, bytecode, warnings } = await compileResponse.json()

      if (warnings && warnings.length > 0) {
        console.warn("Compilation warnings:", warnings)
      }

      console.log("✅ Compilation successful!")
      console.log("Bytecode length:", bytecode.length)

      // Create contract factory with compiled bytecode
      const factory = new ethers.ContractFactory(abi, bytecode, signer)

      // Deploy based on contract type
      if (baseBlock.type === "erc20") {
        console.log("Step 2: Deploying ERC20 token...")
        console.log("Name:", tokenName)
        console.log("Symbol:", tokenSymbol)
        console.log("Initial Supply:", initialSupply)

        // Check if constructor needs parameters (some combined contracts don't)
        console.log("Sending deployment transaction...")
        let contract

        // Try deployment without constructor parameters first (for our generated contracts)
        try {
          contract = await factory.deploy()
        } catch (constructorError) {
          // If it fails, it might need constructor parameters
          console.log("Trying with constructor parameters...")
          const supply = ethers.parseEther(initialSupply)
          contract = await factory.deploy(tokenName, tokenSymbol, supply)
        }

        console.log("Waiting for deployment confirmation...")
        await contract.waitForDeployment()

        // Get contract address and transaction hash
        const contractAddress = await contract.getAddress()
        const deployTx = contract.deploymentTransaction()

        console.log("✅ Contract deployed successfully!")
        console.log("Contract Address:", contractAddress)
        console.log("Transaction Hash:", deployTx?.hash)

        // Save deployment details
        setContractAddress(contractAddress)
        setTxHash(deployTx?.hash || contractAddress)

        setStep("success")
      } else if (baseBlock.type === "nft") {
        console.log("Step 2: Deploying NFT contract...")
        console.log("Name:", tokenName)
        console.log("Symbol:", tokenSymbol)

        // Deploy NFT contract (no constructor parameters in our generated contracts)
        console.log("Sending deployment transaction...")
        const contract = await factory.deploy()

        console.log("Waiting for deployment confirmation...")
        await contract.waitForDeployment()

        // Get contract address and transaction hash
        const contractAddress = await contract.getAddress()
        const deployTx = contract.deploymentTransaction()

        console.log("✅ NFT Contract deployed successfully!")
        console.log("Contract Address:", contractAddress)
        console.log("Transaction Hash:", deployTx?.hash)

        // Save deployment details
        setContractAddress(contractAddress)
        setTxHash(deployTx?.hash || contractAddress)

        setStep("success")
      } else {
        throw new Error("Unsupported contract type")
      }
    } catch (err: any) {
      console.error("Deployment error:", err)
      setError(err.message || "Deployment failed")
      setStep("error")
    } finally {
      setLoading(false)
    }
  }

  const solidityCode = generateSolidityCode(blocks)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal when clicking on backdrop
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
          {/* Step Indicator */}
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

          {/* Connect Wallet Step */}
          {step === "connect" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Connect Wallet</h3>
                <p className="text-sm text-muted">Connect your wallet to deploy contracts on Celo Mainnet or Testnet</p>
              </div>

              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Celo Networks Supported:</p>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Celo Mainnet (Production)</li>
                  <li>• Celo Sepolia Testnet (Testing)</li>
                </ul>
                <p className="text-xs text-muted mt-3">
                  Compatible with any Web3 wallet that supports Celo networks
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

              {/* Wallet Info Card */}
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
                    {currentChainId === CELO_NETWORKS.sepolia.chainId
                      ? "Celo Sepolia Testnet"
                      : currentChainId === CELO_NETWORKS.mainnet.chainId
                        ? "Celo Mainnet"
                        : `Chain ID: ${currentChainId}`}
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
                        const newNetwork = e.target.value as "sepolia" | "mainnet"
                        setNetwork(newNetwork)

                        // Check if we need to switch network
                        const targetChainId = CELO_NETWORKS[newNetwork].chainId
                        if (currentChainId !== targetChainId) {
                          try {
                            setLoading(true)
                            await switchNetwork(newNetwork)
                            setError(null)
                          } catch (err: any) {
                            setError(`Failed to switch network: ${err.message}`)
                          } finally {
                            setLoading(false)
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                      title="Select deployment network"
                    >
                      <option value="sepolia">Celo Sepolia Testnet (Recommended)</option>
                      <option value="mainnet">Celo Mainnet (Production)</option>
                    </select>
                    {currentChainId !== CELO_NETWORKS[network].chainId && (
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true)
                            await switchNetwork(network)
                            setError(null)
                          } catch (err: any) {
                            setError(`Failed to switch network: ${err.message}`)
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-background rounded-lg font-semibold text-sm disabled:opacity-50 whitespace-nowrap"
                      >
                        {loading ? "Switching..." : "Switch Network"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {currentChainId === CELO_NETWORKS[network].chainId ? (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Connected to correct network
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Please switch to {CELO_NETWORKS[network].name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {network === "sepolia"
                      ? "🧪 Celo Sepolia Testnet - Free test tokens, perfect for development"
                      : "🌐 Celo Mainnet - Production network, requires real CELO tokens"}
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
                {contractAddress && (
                  <div>
                    <p className="text-xs text-muted mb-1">Contract Address</p>
                    <p className="text-sm font-mono text-foreground break-all">{contractAddress}</p>
                  </div>
                )}
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
