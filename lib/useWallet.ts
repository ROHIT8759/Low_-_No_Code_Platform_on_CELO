import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { CELO_NETWORKS } from "./celo-config"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setWalletAddress(address)
          setProvider(provider)

          const network = await provider.getNetwork()
          setChainId(Number(network.chainId))
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setWalletAddress(accounts[0])
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const connect = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error("Please install a Celo-compatible wallet")
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      setWalletAddress(address)

      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))

      return address
    } catch (err: any) {
      const errorMessage = err.code === 4001 ? "Connection rejected by user" : err.message || "Failed to connect"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
    setProvider(null)
    setChainId(null)
    setError(null)
  }

  const switchNetwork = async (networkType: "sepolia" | "mainnet") => {
    const networkConfig = CELO_NETWORKS[networkType]

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
      })
      setChainId(networkConfig.chainId)
      return true
    } catch (err: any) {
      if (err.code === 4902) {
        return await addNetwork(networkType)
      }
      throw err
    }
  }

  const addNetwork = async (networkType: "sepolia" | "mainnet") => {
    const networkConfig = CELO_NETWORKS[networkType]

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${networkConfig.chainId.toString(16)}`,
            chainName: networkConfig.name,
            nativeCurrency: networkConfig.nativeCurrency,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.explorerUrl],
          },
        ],
      })
      return true
    } catch (err) {
      throw err
    }
  }

  return {
    walletAddress,
    provider,
    chainId,
    isConnecting,
    error,
    isConnected: !!walletAddress,
    connect,
    disconnect,
    switchNetwork,
    addNetwork,
  }
}
