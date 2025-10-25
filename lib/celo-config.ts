import { ethers } from "ethers"

export const CELO_NETWORKS = {
  alfajores: {
    name: "Alfajores Testnet",
    chainId: 44787,
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    explorerUrl: "https://alfajores-blockscout.celo-testnet.org",
  },
  mainnet: {
    name: "Celo Mainnet",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
    explorerUrl: "https://explorer.celo.org",
  },
}

export async function getProvider(network: "alfajores" | "mainnet" = "alfajores") {
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

export function getExplorerUrl(txHash: string, network: "alfajores" | "mainnet" = "alfajores"): string {
  const config = CELO_NETWORKS[network]
  return `${config.explorerUrl}/tx/${txHash}`
}
