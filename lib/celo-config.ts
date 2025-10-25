import { ethers } from "ethers"
import { defineChain } from 'viem'
import { sepolia } from 'viem/chains'

export const celoSepoliaTestnet = defineChain({
  id: 11142220,
  name: 'Celo Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Celo Sepolia Testnet',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: { http: ['https://forno.celo-sepolia.celo-testnet.org/'] },
    public: { http: ['https://forno.celo-sepolia.celo-testnet.org/'] },
  },
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Testnet Explorer',
      url: 'https://celo-sepolia.blockscout.com/',
    },
  },
  testnet: true,
})

export const CELO_NETWORKS = {
  sepolia: {
    name: "Celo Sepolia Testnet",
    chainId: 11142220,
    rpcUrl: "https://forno.celo-sepolia.celo-testnet.org/",
    explorerUrl: "https://celo-sepolia.blockscout.com/",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
  },
  mainnet: {
    name: "Celo Mainnet",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://celoscan.io",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
  },
}

export { sepolia }

export async function getProvider(network: "sepolia" | "mainnet" = "sepolia") {
  const config = CELO_NETWORKS[network]
  return new ethers.JsonRpcProvider(config.rpcUrl)
}

export async function compileSolidityCode(code: string): Promise<any> {
  // This would typically use solc compiler
  // For now, return a mock compilation result
  console.log("Compiling Solidity code...")
  return {
    abi: [],
    bytecode: "0x",
  }
}

export function getExplorerUrl(txHash: string, network: "sepolia" | "mainnet" = "sepolia"): string {
  const config = CELO_NETWORKS[network]
  return `${config.explorerUrl}/tx/${txHash}`
}
