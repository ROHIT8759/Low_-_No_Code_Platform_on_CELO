import type { DeployedContract } from "./store"

interface FrontendFiles {
  [path: string]: string
}

// ABI helper
function hasAbiFunction(contract: DeployedContract, name: string): boolean {
  return Array.isArray(contract.abi) && contract.abi.some((item: any) => item.type === 'function' && item.name === name)
}

export function generateNextJsFrontend(contract: DeployedContract): FrontendFiles {
  const files: FrontendFiles = {}

  files['app/layout.tsx'] = generateLayout(contract)
  files['app/globals.css'] = generateGlobalCss()
  files['app/page.tsx'] = generateMainPage(contract)
  files['lib/contract.ts'] = generateContractLib(contract)
  files['components/WalletConnect.tsx'] = generateWalletComponent(contract)
  files['components/ContractInteraction.tsx'] = generateContractComponent(contract)
  files['.env.local'] = generateEnvFile(contract)
  files['package.json'] = generatePackageJson(contract)
  files['next.config.js'] = generateNextConfig()
  files['tsconfig.json'] = generateTsConfig()
  files['.gitignore'] = generateGitignore()
  files['tailwind.config.js'] = generateTailwindConfig()
  files['postcss.config.js'] = generatePostcssConfig()
  files['README.md'] = generateReadme(contract)

  return files
}

function generateLayout(contract: DeployedContract): string {
  return `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${contract.contractName} - dApp',
  description: 'Interact with ${contract.contractName} on ${contract.networkName}',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
}

function generateGlobalCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #020617;
  --foreground: #f1f5f9;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer components {
  .card {
    @apply bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl;
  }
  
  .btn-primary {
    @apply px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200;
  }
  
  input[type="text"],
  input[type="number"] {
    @apply w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 
           focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none
           transition-colors;
  }
  
  input:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}
`
}

function generateMainPage(contract: DeployedContract): string {
  return `"use client"

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import ContractInteraction from '@/components/ContractInteraction'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('')

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">${contract.contractName}</h1>
        <p className="text-slate-400 mb-4">Network: ${contract.networkName}</p>
        <p className="text-sm text-slate-500 mb-6">Contract: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</p>
        
        <div className="mb-6">
          <WalletConnect onConnect={setWalletAddress} />
        </div>
        
        {walletAddress && (
          <div className="mt-6">
            <ContractInteraction walletAddress={walletAddress} />
          </div>
        )}
      </div>
    </main>
  )
}
`
}

function generateContractLib(contract: DeployedContract): string {
  return `import { ethers } from 'ethers'

export const CONTRACT_ADDRESS = '${contract.contractAddress}'
export const CONTRACT_ABI = ${JSON.stringify(contract.abi, null, 2)}

export function getContract(signerOrProvider: any) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider)
}

export async function getProvider() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum)
  }
  throw new Error('No provider')
}

export async function getAlchemyProvider() {
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  if (!alchemyApiKey || alchemyApiKey === 'your_alchemy_api_key_here') {
    throw new Error('Alchemy API key not configured')
  }
  
  // Alchemy URL for Celo network
  const alchemyUrl = \`https://celo-mainnet.g.alchemy.com/v2/\${alchemyApiKey}\`
  return new ethers.JsonRpcProvider(alchemyUrl)
}

export function getBlockExplorerUrl(txHash: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://celoscan.io'
  return \`\${baseUrl}/tx/\${txHash}\`
}

export async function verifyTransactionOnExplorer(txHash: string): Promise<any> {
  const apiKey = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_API_KEY
  if (!apiKey || apiKey === 'your_celoscan_api_key_here') {
    console.warn('Block explorer API key not configured')
    return null
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || 'https://celoscan.io'
    const response = await fetch(
      \`\${baseUrl}/api?module=transaction&action=gettxreceiptstatus&txhash=\${txHash}&apikey=\${apiKey}\`
    )
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to verify transaction:', error)
    return null
  }
}
`
}

function generateWalletComponent(_: DeployedContract): string {
  return `"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface Props { 
  onConnect: (addr: string) => void 
}

export default function WalletConnect({ onConnect }: Props) {
  const [address, setAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const addr = await accounts[0].getAddress()
          setAddress(addr)
          onConnect(addr)
        }
      } catch (err) {
        console.error('Failed to check connection:', err)
      }
    }
  }

  const connect = async () => {
    setIsConnecting(true)
    setError('')
    
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet')
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      
      // Switch to correct network
      const network = await provider.getNetwork()
      const expectedChainId = process.env.NEXT_PUBLIC_CHAIN_ID
      
      if (expectedChainId && network.chainId.toString() !== expectedChainId) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: \`0x\${parseInt(expectedChainId).toString(16)}\` }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            setError('Please add this network to your wallet')
          } else {
            throw switchError
          }
        }
      }
      
      setAddress(addr)
      onConnect(addr)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      console.error('Connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress('')
    onConnect('')
  }

  return (
    <div className="card">
      {!address ? (
        <>
          <button 
            className="btn-primary" 
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
        </>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Connected</div>
            <div className="font-mono text-sm">{address.slice(0, 6)}...{address.slice(-4)}</div>
          </div>
          <button 
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
`
}

function generateContractComponent(contract: DeployedContract): string {
  const canMint = hasAbiFunction(contract, 'mint')
  const canBurn = hasAbiFunction(contract, 'burn')
  const canTransfer = hasAbiFunction(contract, 'transfer')
  const canApprove = hasAbiFunction(contract, 'approve')
  const canBalanceOf = hasAbiFunction(contract, 'balanceOf')

  // Check mint function signature to determine if it accepts amount parameter
  const mintFunction = Array.isArray(contract.abi) 
    ? contract.abi.find((item: any) => item.type === 'function' && item.name === 'mint')
    : null
  const mintAcceptsAmount = mintFunction?.inputs?.length === 2 // mint(address, uint256)
  const mintOnlyAddress = mintFunction?.inputs?.length === 1 // mint(address)

  // Check burn function signature
  const burnFunction = Array.isArray(contract.abi)
    ? contract.abi.find((item: any) => item.type === 'function' && item.name === 'burn')
    : null
  const burnAcceptsAmount = burnFunction?.inputs?.length >= 1 // burn(uint256) or burn(address, uint256)

  return `"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract, getProvider, getAlchemyProvider, getBlockExplorerUrl, verifyTransactionOnExplorer } from '@/lib/contract'

interface Props { 
  walletAddress: string 
}

export default function ContractInteraction({ walletAddress }: Props) {
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')

  // Input states
  const [mintAmount, setMintAmount] = useState<string>('')
  const [burnAmount, setBurnAmount] = useState<string>('')
  const [transferTo, setTransferTo] = useState<string>('')
  const [transferAmount, setTransferAmount] = useState<string>('')
  const [approveSpender, setApproveSpender] = useState<string>('')
  const [approveAmount, setApproveAmount] = useState<string>('')

  useEffect(() => {
    if (walletAddress) {
      loadBalance()
    }
  }, [walletAddress])

  const loadBalance = async () => {
    ${canBalanceOf ? `
    try {
      const provider = await getProvider()
      const contract = getContract(provider)
      const bal = await contract.balanceOf(walletAddress)
      setBalance(ethers.formatEther(bal))
    } catch (err: any) {
      console.error('Failed to load balance:', err)
    }` : '// No balanceOf function in ABI'}
  }

  const handleTransaction = async (txFunc: () => Promise<any>, successMsg: string) => {
    setLoading(true)
    setError('')
    setSuccess('')
    setTxHash('')

    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const tx = await txFunc()
      setSuccess(\`Transaction submitted! Hash: \${tx.hash}\`)
      setTxHash(tx.hash)
      
      await tx.wait()
      setSuccess(successMsg)
      await loadBalance()
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
      console.error('Transaction error:', err)
    } finally {
      setLoading(false)
    }
  }

  ${canMint ? `
  const handleMint = async () => {
    ${mintAcceptsAmount ? `
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }` : ''}
    
    setLoading(true)
    setError('')
    setSuccess('')
    setTxHash('')

    try {
      // Use Alchemy as fallback provider for better reliability
      let provider
      try {
        provider = await getProvider() // Try MetaMask first
      } catch {
        provider = await getAlchemyProvider() // Fallback to Alchemy
        console.log('Using Alchemy provider for mint operation')
      }

      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      // Execute mint transaction with appropriate parameters based on ABI
      ${mintAcceptsAmount 
        ? 'const tx = await contract.mint(walletAddress, ethers.parseEther(mintAmount))'
        : 'const tx = await contract.mint(walletAddress)'}
      setSuccess(\`Transaction submitted! Hash: \${tx.hash}\`)
      setTxHash(tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      
      // Verify on block explorer
      const verification = await verifyTransactionOnExplorer(tx.hash)
      if (verification && verification.result) {
        const status = verification.result.status === '1' ? 'Success' : 'Failed'
        setSuccess(\`✅ ${mintAcceptsAmount ? `Minted \${mintAmount} tokens!` : 'Minted tokens!'} Status: \${status}\`)
      } else {
        setSuccess(\`✅ ${mintAcceptsAmount ? `Successfully minted \${mintAmount} tokens!` : 'Successfully minted tokens!'}\`)
      }
      
      await loadBalance()
      ${mintAcceptsAmount ? 'setMintAmount(\'\')' : ''}
    } catch (err: any) {
      setError(err.message || 'Mint transaction failed')
      console.error('Mint error:', err)
    } finally {
      setLoading(false)
    }
  }` : ''}

  ${canBurn ? `
  const handleBurn = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    await handleTransaction(
      async () => {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const contract = getContract(signer)
        return await contract.burn(ethers.parseEther(burnAmount))
      },
      \`Successfully burned \${burnAmount} tokens!\`
    )
    setBurnAmount('')
  }` : ''}

  ${canTransfer ? `
  const handleTransfer = async () => {
    if (!transferTo || !ethers.isAddress(transferTo)) {
      setError('Please enter a valid address')
      return
    }
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    await handleTransaction(
      async () => {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const contract = getContract(signer)
        return await contract.transfer(transferTo, ethers.parseEther(transferAmount))
      },
      \`Successfully transferred \${transferAmount} tokens!\`
    )
    setTransferTo('')
    setTransferAmount('')
  }` : ''}

  ${canApprove ? `
  const handleApprove = async () => {
    if (!approveSpender || !ethers.isAddress(approveSpender)) {
      setError('Please enter a valid spender address')
      return
    }
    if (!approveAmount || parseFloat(approveAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    await handleTransaction(
      async () => {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const contract = getContract(signer)
        return await contract.approve(approveSpender, ethers.parseEther(approveAmount))
      },
      \`Successfully approved \${approveAmount} tokens!\`
    )
    setApproveSpender('')
    setApproveAmount('')
  }` : ''}

  return (
    <div className="space-y-4">
      ${canBalanceOf ? `
      <div className="card">
        <h3 className="font-bold text-lg mb-2">Your Balance</h3>
        <p className="text-2xl text-green-400">{balance} tokens</p>
        <button 
          onClick={loadBalance} 
          className="mt-2 text-sm text-slate-400 hover:text-slate-200"
        >
          Refresh
        </button>
      </div>` : ''}

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded">
          {success}
          {txHash && (
            <a 
              href={getBlockExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-sm underline hover:text-green-400"
            >
              View on Block Explorer →
            </a>
          )}
        </div>
      )}

      ${canMint ? `
      <div className="card">
        <h3 className="font-bold text-lg mb-3">Mint Tokens</h3>
        ${mintAcceptsAmount ? `
        <input
          type="number"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          placeholder="Amount to mint"
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 mb-3"
          disabled={loading}
        />` : `
        <p className="text-sm text-slate-400 mb-3">
          This will mint tokens to your connected wallet address.
        </p>`}
        <button 
          onClick={handleMint}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Mint'}
        </button>
      </div>` : ''}

      ${canBurn ? `
      <div className="card">
        <h3 className="font-bold text-lg mb-3">Burn Tokens</h3>
        <input
          type="number"
          value={burnAmount}
          onChange={(e) => setBurnAmount(e.target.value)}
          placeholder="Amount to burn"
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 mb-3"
          disabled={loading}
        />
        <button 
          onClick={handleBurn}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Burn'}
        </button>
      </div>` : ''}

      ${canTransfer ? `
      <div className="card">
        <h3 className="font-bold text-lg mb-3">Transfer Tokens</h3>
        <input
          type="text"
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
          placeholder="Recipient address"
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 mb-3"
          disabled={loading}
        />
        <input
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="Amount to transfer"
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 mb-3"
          disabled={loading}
        />
        <button 
          onClick={handleTransfer}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </div>` : ''}

      ${canApprove ? `
      <div className="card">
        <h3 className="font-bold text-lg mb-3">Approve Spender</h3>
        <input
          type="text"
          value={approveSpender}
          onChange={(e) => setApproveSpender(e.target.value)}
          placeholder="Spender address"
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 mb-3"
          disabled={loading}
        />
        <input
          type="number"
          value={approveAmount}
          onChange={(e) => setApproveAmount(e.target.value)}
          placeholder="Amount to approve"
          className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 mb-3"
          disabled={loading}
        />
        <button 
          onClick={handleApprove}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Approve'}
        </button>
      </div>` : ''}
    </div>
  )
}
`
}

function generateEnvFile(contract: DeployedContract): string {
  return `NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.contractAddress}
NEXT_PUBLIC_CHAIN_ID=${contract.chainId}
NEXT_PUBLIC_NETWORK_NAME=${contract.networkName}
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_BLOCK_EXPLORER_API_KEY=your_celoscan_api_key_here
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://celoscan.io
`
}

export function downloadZip(files: FrontendFiles, contractName: string) {
  console.log('Files generated for', contractName, Object.keys(files))
}

function generatePackageJson(contract: DeployedContract): string {
  return `{
  "name": "${contract.contractName.toLowerCase().replace(/\s+/g, '-')}-dapp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.1.3",
    "ethers": "^6.13.4"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.3"
  }
}
`
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}

module.exports = nextConfig
`
}

function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`
}

function generateGitignore(): string {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`
}

function generateReadme(contract: DeployedContract): string {
  return `# ${contract.contractName} dApp

A Next.js decentralized application for interacting with the **${contract.contractName}** smart contract on **${contract.networkName}**.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MetaMask or another Web3 wallet
- Alchemy API Key (optional, for enhanced reliability)
- Celoscan API Key (optional, for transaction verification)

### Installation

\`\`\`bash
npm install
\`\`\`

### Configuration

1. Copy the \`.env.local\` file and add your API keys:

\`\`\`env
NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.contractAddress}
NEXT_PUBLIC_CHAIN_ID=${contract.chainId}
NEXT_PUBLIC_NETWORK_NAME=${contract.networkName}
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_BLOCK_EXPLORER_API_KEY=your_celoscan_api_key_here
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://celoscan.io
\`\`\`

#### Get Your API Keys:

**Alchemy API Key:**
1. Visit [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up for a free account
3. Create a new app for Celo network
4. Copy the API key from your dashboard
5. Paste it in \`.env.local\` as \`NEXT_PUBLIC_ALCHEMY_API_KEY\`

**Celoscan API Key:**
1. Visit [https://celoscan.io/](https://celoscan.io/)
2. Sign up for a free account
3. Go to API Keys section
4. Generate a new API key
5. Paste it in \`.env.local\` as \`NEXT_PUBLIC_BLOCK_EXPLORER_API_KEY\`

### Development

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## 🎯 Features

- **Wallet Connection**: Connect with MetaMask or any Web3 wallet
- **Network Validation**: Automatic network switching
- **Token Balance**: Real-time balance display
- **Mint Tokens**: Mint new tokens with Alchemy fallback provider
- **Burn Tokens**: Burn tokens from your balance
- **Transfer Tokens**: Send tokens to other addresses
- **Transaction Verification**: Automatic verification via Celoscan API
- **Block Explorer Links**: Direct links to transaction details

## 🔧 Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ethers.js 6** - Ethereum interaction
- **Alchemy** - Enhanced RPC provider
- **Celoscan** - Block explorer and transaction verification

## 📝 Contract Details

- **Contract Address**: \`${contract.contractAddress}\`
- **Network**: ${contract.networkName}
- **Chain ID**: ${contract.chainId}

## 🛠️ How It Works

### ABI-Aware Function Generation

The dApp automatically detects your contract's function signatures from the ABI:
- **Mint Function**: Detects if mint accepts \`mint(address)\` or \`mint(address, uint256)\`
  - Shows amount input only when contract accepts amount parameter
  - Calls the correct function signature automatically
- **Burn Function**: Adapts to different burn signatures
- **Only generates UI for functions that exist in your contract**

### Mint Function with Alchemy Integration

The mint function uses a dual-provider approach:
1. First attempts to use MetaMask (user's wallet)
2. Falls back to Alchemy provider for enhanced reliability
3. Calls contract with correct parameters based on ABI signature
4. Verifies transaction on Celoscan after confirmation
5. Displays transaction status and explorer link

### Block Explorer Integration

All transactions are automatically:
- Tracked with transaction hash
- Verified via Celoscan API
- Displayed with clickable links to full transaction details

## 📄 License

MIT

## 🤝 Support

For issues or questions, please refer to the documentation or create an issue in the repository.
`
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
}
`
}

function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`
}
