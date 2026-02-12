import { useState, useEffect, useCallback } from "react"
import * as StellarSdk from "@stellar/stellar-sdk"

interface StellarWallet {
  publicKey: string
  network: string
}

export function useWallet() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFreighterAvailable, setIsFreighterAvailable] = useState(false)

  useEffect(() => {
    checkFreighterAvailability()
    checkConnection()
  }, [])

  const checkFreighterAvailability = () => {
    if (typeof window !== "undefined" && window.freighter) {
      setIsFreighterAvailable(true)
    }
  }

  const checkConnection = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.freighter) {
        return
      }

      const { isConnected } = await window.freighter.isConnected()
      if (isConnected) {
        const publicKey = await window.freighter.getPublicKey()
        const network = await window.freighter.getNetwork()
        setWalletAddress(publicKey)
        setNetwork(network === "PUBLIC" ? "mainnet" : "testnet")
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err)
    }
  }, [])

  const connect = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      if (typeof window === "undefined" || !window.freighter) {
        throw new Error("Please install Freighter wallet extension")
      }

      const { isConnected } = await window.freighter.isConnected()
      if (!isConnected) {
        await window.freighter.connect()
      }

      const publicKey = await window.freighter.getPublicKey()
      const networkInfo = await window.freighter.getNetwork()
      
      setWalletAddress(publicKey)
      setNetwork(networkInfo === "PUBLIC" ? "mainnet" : "testnet")

      return publicKey
    } catch (err: any) {
      const errorMessage = err.message || "Failed to connect to Freighter wallet"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
    setError(null)
  }

  const switchNetwork = async (targetNetwork: "testnet" | "mainnet") => {
    try {
      if (typeof window === "undefined" || !window.freighter) {
        throw new Error("Freighter wallet not available")
      }

      const networkPassphrase = targetNetwork === "mainnet" 
        ? "Public Global Stellar Network ; September 2015"
        : "Test SDF Network ; September 2015"

      await window.freighter.setNetwork(networkPassphrase)
      setNetwork(targetNetwork)
      
      return true
    } catch (err: any) {
      console.error("Error switching network:", err)
      throw err
    }
  }

  const signTransaction = async (xdr: string, network: "testnet" | "mainnet"): Promise<string> => {
    try {
      if (typeof window === "undefined" || !window.freighter) {
        throw new Error("Freighter wallet not available")
      }

      const signedXdr = await window.freighter.signTransaction(xdr, {
        networkPassphrase: network === "mainnet" 
          ? "Public Global Stellar Network ; September 2015"
          : "Test SDF Network ; September 2015"
      })

      return signedXdr
    } catch (err: any) {
      console.error("Error signing transaction:", err)
      throw new Error(err.message || "Failed to sign transaction")
    }
  }

  return {
    walletAddress,
    network,
    isConnecting,
    error,
    isConnected: !!walletAddress,
    isFreighterAvailable,
    connect,
    disconnect,
    switchNetwork,
    signTransaction,
  }
}

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean; error?: string }>
      connect: () => Promise<{ publicKey: string; error?: string }>
      getPublicKey: () => Promise<string>
      getNetwork: () => Promise<string>
      setNetwork: (networkPassphrase: string) => Promise<void>
      signTransaction: (xdr: string, options?: { networkPassphrase?: string }) => Promise<string>
    }
  }
}
