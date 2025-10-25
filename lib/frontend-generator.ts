import type { DeployedContract, Block } from "./store"

interface FrontendFiles {
  [key: string]: string
}

export function generateNextJsFrontend(contract: DeployedContract): FrontendFiles {
  const files: FrontendFiles = {}

  // Generate package.json
  files["package.json"] = generatePackageJson(contract)

  // Generate next.config.js
  files["next.config.js"] = generateNextConfig()

  // Generate tsconfig.json
  files["tsconfig.json"] = generateTsConfig()

  // Generate .gitignore
  files[".gitignore"] = generateGitignore()

  // Generate README.md
  files["README.md"] = generateReadme(contract)

  // Generate app/page.tsx (main page)
  files["app/page.tsx"] = generateMainPage(contract)

  // Generate app/layout.tsx
  files["app/layout.tsx"] = generateLayout(contract)

  // Generate app/globals.css
  files["app/globals.css"] = generateGlobalCss()

  // Generate lib/contract.ts (contract interaction)
  files["lib/contract.ts"] = generateContractLib(contract)

  // Generate components/ContractInteraction.tsx
  files["components/ContractInteraction.tsx"] = generateContractComponent(contract)

  // Generate components/WalletConnect.tsx
  files["components/WalletConnect.tsx"] = generateWalletComponent(contract)

  // Generate .env.local
  files[".env.local"] = generateEnvFile(contract)

  return files
}

function generatePackageJson(contract: DeployedContract): string {
  return JSON.stringify(
    {
      name: contract.contractName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        next: "^14.0.0",
        ethers: "^6.9.0",
        "@rainbow-me/rainbowkit": "^2.0.0",
        wagmi: "^2.0.0",
        viem: "^2.0.0",
        "@tanstack/react-query": "^5.0.0",
      },
      devDependencies: {
        "@types/node": "^20.0.0",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        typescript: "^5.0.0",
        tailwindcss: "^3.3.0",
        postcss: "^8.4.0",
        autoprefixer: "^10.4.0",
      },
    },
    null,
    2
  )
}

function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
}

module.exports = nextConfig
`
}

function generateTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: {
          "@/*": ["./*"],
        },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2
  )
}

function generateGitignore(): string {
  return `# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# Typescript
*.tsbuildinfo
next-env.d.ts
`
}

function generateReadme(contract: DeployedContract): string {
  return `# ${contract.contractName} dApp

A Next.js frontend for interacting with the **${contract.contractName}** smart contract deployed on **${contract.networkName}**.

## 📄 Contract Information

- **Contract Address:** \`${contract.contractAddress}\`
- **Network:** ${contract.networkName} (Chain ID: ${contract.chainId})
- **Type:** ${contract.contractType.toUpperCase()}
- **Deployed:** ${new Date(contract.deployedAt).toLocaleString()}
- **Transaction:** [View on Explorer](${contract.explorerUrl})

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 2. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the dApp.

## 🔧 Configuration

The contract address and network are pre-configured in \`lib/contract.ts\`. No additional setup required!

## 📦 Features

${contract.blocks.map((block) => `- **${block.type.toUpperCase()}**: ${block.label}`).join("\n")}

## 🌐 Deployment

### Deploy to Vercel

\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Deploy to Netlify

\`\`\`bash
npm run build
netlify deploy --prod
\`\`\`

## 📝 Smart Contract

The smart contract source code and ABI are included in this repository for reference and verification.

## 🛠 Built With

- [Next.js](https://nextjs.org/) - React Framework
- [ethers.js](https://docs.ethers.org/) - Ethereum Library
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [RainbowKit](https://www.rainbowkit.com/) - Wallet Connection

## 📄 License

MIT

---

Generated with ❤️ by Celo No-Code Builder
`
}

function generateLayout(contract: DeployedContract): string {
  return `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${contract.contractName} - dApp',
  description: 'Interact with ${contract.contractName} smart contract on ${contract.networkName}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
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
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 15, 23, 42;
  --background-end-rgb: 30, 41, 59;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
  min-height: 100vh;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`
}

function generateMainPage(contract: DeployedContract): string {
  return `'use client'

import { useState, useEffect } from 'react'
import ContractInteraction from '@/components/ContractInteraction'
import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
            ${contract.contractName}
          </h1>
          <p className="text-slate-400 text-lg">
            ${contract.tokenName ? `${contract.tokenName} (${contract.tokenSymbol})` : `Interact with your ${contract.contractType.toUpperCase()} contract`}
          </p>
        </div>

        {/* Network Info */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-slate-500">Network</div>
              <div className="text-white font-semibold">${contract.networkName}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Contract Address</div>
              <div className="text-green-400 font-mono text-sm break-all">
                ${contract.contractAddress.slice(0, 10)}...${contract.contractAddress.slice(-8)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Type</div>
              <div className="text-white font-semibold">${contract.contractType.toUpperCase()}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <a
              href="${contract.explorerUrl}"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              View on Explorer
            </a>
            <button
              onClick={() => navigator.clipboard.writeText('${contract.contractAddress}')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              Copy Address
            </button>
          </div>
        </div>

        {/* Wallet Connection */}
        <WalletConnect onConnect={setWalletAddress} />

        {/* Contract Interaction */}
        {walletAddress && <ContractInteraction walletAddress={walletAddress} />}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Built with Celo No-Code Builder</p>
          <p className="mt-2">Deployed: ${new Date(contract.deployedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </main>
  )
}
`
}

function generateContractLib(contract: DeployedContract): string {
  return `import { ethers } from 'ethers'

export const CONTRACT_ADDRESS = '${contract.contractAddress}'
export const NETWORK_NAME = '${contract.networkName}'
export const CHAIN_ID = ${contract.chainId}

export const CONTRACT_ABI = ${JSON.stringify(contract.abi, null, 2)}

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider)
}

export async function getProvider() {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  throw new Error('No Ethereum provider found')
}

export async function connectWallet() {
  const provider = await getProvider()
  await provider.send('eth_requestAccounts', [])
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  return { provider, signer, address }
}

declare global {
  interface Window {
    ethereum?: any
  }
}
`
}

function generateWalletComponent(contract: DeployedContract): string {
  return `'use client'

import { useState, useEffect } from 'react'
import { getProvider } from '@/lib/contract'

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = await getProvider()
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const addr = accounts[0].address
          setAddress(addr)
          onConnect(addr)
        }
      }
    } catch (err) {
      console.error('Check connection error:', err)
    }
  }

  const connect = async () => {
    setConnecting(true)
    setError(null)

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        setError('Please install MetaMask or another Web3 wallet!')
        return
      }

      const provider = await getProvider()
      await provider.send('eth_requestAccounts', [])
      
      const signer = await provider.getSigner()
      const addr = await signer.getAddress()
      
      // Check network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== ${contract.chainId}) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x' + ${contract.chainId}.toString(16) }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            setError('Please add ${contract.networkName} to your wallet')
          } else {
            setError('Please switch to ${contract.networkName}')
          }
          return
        }
      }
      
      setAddress(addr)
      onConnect(addr)
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setAddress(null)
    onConnect('')
  }

  if (address) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 mb-1">Connected Wallet</div>
            <div className="text-green-400 font-mono text-lg">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8 text-center">
      <div className="text-6xl mb-4">🦊</div>
      <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
      <p className="text-slate-400 mb-6">
        Connect your wallet to interact with the smart contract
      </p>
      <button
        onClick={connect}
        disabled={connecting}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}
`
}

function generateFunctionComponents(contract: DeployedContract): string {
  const blocks = contract.blocks
  let functions = ""

  // Generate function handlers based on blocks
  if (blocks.some((b) => b.type === "mint")) {
    functions += `
  const handleMint = async (to: string, amount: string) => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const amountWei = ethers.parseEther(amount)
      const tx = await contract.mint(to, amountWei)
      await tx.wait()
      
      showNotification('✅ Minted successfully!', 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Minting failed'), 'error')
    } finally {
      setLoading(false)
    }
  }
`
  }

  if (blocks.some((b) => b.type === "burn")) {
    functions += `
  const handleBurn = async (amount: string) => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const amountWei = ethers.parseEther(amount)
      const tx = await contract.burn(amountWei)
      await tx.wait()
      
      showNotification('✅ Burned successfully!', 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Burning failed'), 'error')
    } finally {
      setLoading(false)
    }
  }
`
  }

  if (blocks.some((b) => b.type === "transfer")) {
    functions += `
  const handleTransfer = async (to: string, amount: string) => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const amountWei = ethers.parseEther(amount)
      const tx = await contract.transfer(to, amountWei)
      await tx.wait()
      
      showNotification('✅ Transferred successfully!', 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Transfer failed'), 'error')
    } finally {
      setLoading(false)
    }
  }
`
  }

  if (blocks.some((b) => b.type === "stake")) {
    functions += `
  const handleStake = async (amount: string) => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const amountWei = ethers.parseEther(amount)
      const tx = await contract.stake(amountWei)
      await tx.wait()
      
      showNotification('✅ Staked successfully!', 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Staking failed'), 'error')
    } finally {
      setLoading(false)
    }
  }
`
  }

  if (blocks.some((b) => b.type === "pausable")) {
    functions += `
  const handlePause = async () => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const tx = await contract.pause()
      await tx.wait()
      
      showNotification('✅ Contract paused!', 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Pause failed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpause = async () => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const tx = await contract.unpause()
      await tx.wait()
      
      showNotification('✅ Contract unpaused!', 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Unpause failed'), 'error')
    } finally {
      setLoading(false)
    }
  }
`
  }

  // Read functions
  functions += `
  const handleGetBalance = async () => {
    setLoading(true)
    try {
      const provider = await getProvider()
      const contract = getContract(provider)
      
      const balance = await contract.balanceOf(walletAddress)
      const formatted = ethers.formatEther(balance)
      
      showNotification(\`Balance: \${formatted} tokens\`, 'success')
    } catch (err: any) {
      showNotification('❌ ' + (err.message || 'Failed to get balance'), 'error')
    } finally {
      setLoading(false)
    }
  }
`

  return functions
}

function generateFunctionCalls(contract: DeployedContract): string[] {
  const blocks = contract.blocks
  const calls: string[] = []

  if (blocks.some((b) => b.type === "mint")) {
    calls.push(`<MintCard handleMint={handleMint} loading={loading} />`)
  }

  if (blocks.some((b) => b.type === "burn")) {
    calls.push(`<BurnCard handleBurn={handleBurn} loading={loading} />`)
  }

  if (blocks.some((b) => b.type === "transfer")) {
    calls.push(`<TransferCard handleTransfer={handleTransfer} loading={loading} />`)
  }

  if (blocks.some((b) => b.type === "stake")) {
    calls.push(`<StakeCard handleStake={handleStake} loading={loading} />`)
  }

  if (blocks.some((b) => b.type === "pausable")) {
    calls.push(`<PauseCard handlePause={handlePause} handleUnpause={handleUnpause} loading={loading} />`)
  }

  calls.push(`<BalanceCard handleGetBalance={handleGetBalance} loading={loading} />`)

  return calls
}

// Add function card components at the end of the file
function generateContractComponent(contract: DeployedContract): string {
  const functions = generateFunctionComponents(contract)
  const functionCalls = generateFunctionCalls(contract)

  return `'use client'

import { useState } from 'react'
import { getContract, getProvider } from '@/lib/contract'
import { ethers } from 'ethers'

interface ContractInteractionProps {
  walletAddress: string
}

export default function ContractInteraction({ walletAddress }: ContractInteractionProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    if (type === 'success') {
      setResult(message)
      setError(null)
    } else if (type === 'error') {
      setError(message)
      setResult(null)
    } else {
      setResult(message)
      setError(null)
    }

    setTimeout(() => {
      setResult(null)
      setError(null)
    }, 5000)
  }

${functions}

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {result && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
          {result}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Contract Functions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Function Cards */}
        ${generateInlineFunctionCards(contract.blocks).join("\n        ")}
      </div>
    </div>
  )
}
`
}

function generateInlineFunctionCards(blocks: Block[]): string[] {
  const cards: string[] = []

  if (blocks.some((b) => b.type === "mint")) {
    cards.push(`{/* Mint Function */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-bold mb-4">🪙 Mint Tokens</h3>
          <input
            id="mintTo"
            type="text"
            placeholder="Recipient Address"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg mb-3 text-white"
          />
          <input
            id="mintAmount"
            type="number"
            placeholder="Amount"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg mb-3 text-white"
          />
          <button
            onClick={() => {
              const to = (document.getElementById('mintTo') as HTMLInputElement).value
              const amount = (document.getElementById('mintAmount') as HTMLInputElement).value
              handleMint(to, amount)
            }}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Mint'}
          </button>
        </div>`)
  }

  if (blocks.some((b) => b.type === "burn")) {
    cards.push(`{/* Burn Function */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-bold mb-4">🔥 Burn Tokens</h3>
          <input
            id="burnAmount"
            type="number"
            placeholder="Amount to burn"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg mb-3 text-white"
          />
          <button
            onClick={() => {
              const amount = (document.getElementById('burnAmount') as HTMLInputElement).value
              handleBurn(amount)
            }}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Burn'}
          </button>
        </div>`)
  }

  if (blocks.some((b) => b.type === "transfer")) {
    cards.push(`{/* Transfer Function */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-bold mb-4">💸 Transfer Tokens</h3>
          <input
            id="transferTo"
            type="text"
            placeholder="Recipient Address"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg mb-3 text-white"
          />
          <input
            id="transferAmount"
            type="number"
            placeholder="Amount"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg mb-3 text-white"
          />
          <button
            onClick={() => {
              const to = (document.getElementById('transferTo') as HTMLInputElement).value
              const amount = (document.getElementById('transferAmount') as HTMLInputElement).value
              handleTransfer(to, amount)
            }}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </div>`)
  }

  if (blocks.some((b) => b.type === "stake")) {
    cards.push(`{/* Stake Function */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-bold mb-4">🔒 Stake Tokens</h3>
          <input
            id="stakeAmount"
            type="number"
            placeholder="Amount to stake"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg mb-3 text-white"
          />
          <button
            onClick={() => {
              const amount = (document.getElementById('stakeAmount') as HTMLInputElement).value
              handleStake(amount)
            }}
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Stake'}
          </button>
        </div>`)
  }

  if (blocks.some((b) => b.type === "pausable")) {
    cards.push(`{/* Pause Functions */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-bold mb-4">⏸️ Pause Control</h3>
          <div className="space-y-2">
            <button
              onClick={handlePause}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pause Contract'}
            </button>
            <button
              onClick={handleUnpause}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Unpause Contract'}
            </button>
          </div>
        </div>`)
  }

  // Always include balance
  cards.push(`{/* Get Balance */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-bold mb-4">💰 Check Balance</h3>
          <p className="text-slate-400 text-sm mb-4">View your token balance</p>
          <button
            onClick={handleGetBalance}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Balance'}
          </button>
        </div>`)

  return cards
}

function generateEnvFile(contract: DeployedContract): string {
  return `# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.contractAddress}
NEXT_PUBLIC_CHAIN_ID=${contract.chainId}
NEXT_PUBLIC_NETWORK_NAME=${contract.networkName}
`
}

export function downloadZip(files: FrontendFiles, contractName: string) {
  // This would require JSZip library in actual implementation
  // For now, we'll download files individually or use an API endpoint
  console.log("Generated files:", Object.keys(files))
}
