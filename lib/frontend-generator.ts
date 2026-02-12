import type { DeployedContract } from "./store"

interface FrontendFiles {
  [path: string]: string
}

function hasAbiFunction(contract: DeployedContract, name: string): boolean {
  return Array.isArray(contract.abi) && contract.abi.some((item: any) => item.type === 'function' && item.name === name)
}

export function generateNextJsFrontend(contract: DeployedContract): FrontendFiles {
  if (contract.networkType === 'stellar') {
    return generateStellarFrontend(contract);
  }

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

function generateStellarFrontend(contract: DeployedContract): FrontendFiles {
  const files: FrontendFiles = {};

  
  files['app/layout.tsx'] = generateLayout(contract);
  files['app/globals.css'] = generateGlobalCss();
  files['app/page.tsx'] = generateStellarMainPage(contract);

  
  files['lib/stellar.ts'] = generateStellarLib(contract);
  files['components/WalletConnect.tsx'] = generateStellarWalletComponent();

  
  files['package.json'] = generateStellarPackageJson(contract);
  files['next.config.js'] = generateNextConfig();
  files['tsconfig.json'] = generateTsConfig();
  files['.gitignore'] = generateGitignore();
  files['README.md'] = generateStellarReadme(contract);

  return files;
}

function generateStellarMainPage(contract: DeployedContract): string {
  return `"use client"

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  const [walletPublicKey, setWalletPublicKey] = useState<string>('')

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">${contract.contractName}</h1>
        <p className="text-slate-400 mb-4">Network: ${contract.networkName}</p>
        <p className="text-sm text-slate-500 mb-6">Contract ID: {process.env.NEXT_PUBLIC_CONTRACT_ID}</p>
        
        <div className="mb-6">
          <WalletConnect onConnect={setWalletPublicKey} />
        </div>
        
        {walletPublicKey && (
          <div className="mt-6">
            <div className="card">
               <h2 className="text-xl font-bold mb-4">Contract Interaction</h2>
               <p>Stellar interaction components for Soroban contracts would go here.</p>
               {/* Add dedicated components for invoking Soroban contract functions */}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
`;
}

function generateStellarLib(contract: DeployedContract): string {
  return `import { checkConnection, isAllowed, setAllowed } from "@stellar/freighter-api";

export async function connectWallet() {
    if (await isAllowed()) {
        return await checkConnection();
    } else {
        await setAllowed();
        return await checkConnection();
    }
}
`;
}

function generateStellarWalletComponent(): string {
  return `"use client"
import { useState } from 'react';
import { isAllowed, setAllowed, getUserInfo } from "@stellar/freighter-api";

export default function WalletConnect({ onConnect }: { onConnect: (key: string) => void }) {
    const [publicKey, setPublicKey] = useState<string>("");
    
    const connect = async () => {
        if (await isAllowed()) {
            const { publicKey } = await getUserInfo();
            setPublicKey(publicKey);
            onConnect(publicKey);
        } else {
            await setAllowed();
            const { publicKey } = await getUserInfo();
            setPublicKey(publicKey);
            onConnect(publicKey);
        }
    };

    return (
        <div className="card">
            {!publicKey ? (
                <button onClick={connect} className="btn-primary">Connect Freighter Wallet</button>
            ) : (
                <div>
                   <p className="text-green-400">Connected: {publicKey}</p>
                </div>
            )}
        </div>
    );
}
`;
}

function generateStellarPackageJson(contract: DeployedContract): string {
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
    "@stellar/freighter-api": "^2.0.0",
    "@stellar/stellar-sdk": "^13.0.0",
    "lucide-react": "^0.473.0"
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
`;
}

function generateStellarReadme(contract: DeployedContract): string {
  return `# ${contract.contractName} dApp (Stellar)

A Next.js decentralized application for interacting with the **${contract.contractName}** smart contract on **${contract.networkName}**.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Freighter Wallet Extension

### Installation

\`\`\`bash
npm install
\`\`\`

### Configuration

1. Copy the \`.env.local\` file and add your Contract ID:

\`\`\`env
NEXT_PUBLIC_CONTRACT_ID=${contract.contractAddress}
NEXT_PUBLIC_NETWORK=${contract.networkName}
\`\`\`

### Run locally

\`\`\`bash
npm run dev
\`\`\`
`;
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
  const alchemyUrl = \`https:
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
  // Helpers to identify function types
  const getFunctionsByType = (type: 'view' | 'pure' | 'nonpayable' | 'payable') => {
    return Array.isArray(contract.abi)
      ? contract.abi.filter((item: any) => item.type === 'function' && item.stateMutability === type)
      : []
  }

  const readFunctions = [...getFunctionsByType('view'), ...getFunctionsByType('pure')]
  const writeFunctions = [...getFunctionsByType('nonpayable'), ...getFunctionsByType('payable')]

  // Filter out standard functions we already handle explicitly
  const standardMethods = ['mint', 'burn', 'transfer', 'approve', 'balanceOf', 'transferFrom', 'allowance']

  const customReadFunctions = readFunctions.filter(f => !standardMethods.includes(f.name))
  const customWriteFunctions = writeFunctions.filter(f => !standardMethods.includes(f.name))

  const canMint = hasAbiFunction(contract, 'mint')
  const canBurn = hasAbiFunction(contract, 'burn')
  const canTransfer = hasAbiFunction(contract, 'transfer')
  const canApprove = hasAbiFunction(contract, 'approve')
  const canBalanceOf = hasAbiFunction(contract, 'balanceOf')

  // Check mint function signature
  const mintFunction = Array.isArray(contract.abi)
    ? contract.abi.find((item: any) => item.type === 'function' && item.name === 'mint')
    : null
  const mintAcceptsAmount = mintFunction?.inputs?.length === 2 // mint(address, uint256)

  // Check burn function signature
  const burnFunction = Array.isArray(contract.abi)
    ? contract.abi.find((item: any) => item.type === 'function' && item.name === 'burn')
    : null
  // const burnAcceptsAmount = burnFunction?.inputs?.length >= 1 

  return `"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract, getProvider, getAlchemyProvider, getBlockExplorerUrl, verifyTransactionOnExplorer } from '@/lib/contract'
import { ChevronDown, ChevronUp, Play, Eye, Activity } from 'lucide-react'

interface Props { 
  walletAddress: string 
}

export default function ContractInteraction({ walletAddress }: Props) {
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')
  
  
  const [mintAmount, setMintAmount] = useState<string>('')
  const [burnAmount, setBurnAmount] = useState<string>('')
  const [transferTo, setTransferTo] = useState<string>('')
  const [transferAmount, setTransferAmount] = useState<string>('')
  const [approveSpender, setApproveSpender] = useState<string>('')
  const [approveAmount, setApproveAmount] = useState<string>('')

  
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({})
  const [functionOutputs, setFunctionOutputs] = useState<Record<string, string>>({})
  const [expandedFunctions, setExpandedFunctions] = useState<Record<string, boolean>>({})

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

  const handleInputChange = (funcName: string, argName: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [\`\${funcName}_\${argName}\`]: value
    }))
  }

  const toggleFunction = (funcName: string) => {
    setExpandedFunctions(prev => ({
      ...prev,
      [funcName]: !prev[funcName]
    }))
  }

  
  const handleRead = async (funcName: string, inputs: any[]) => {
    try {
      const provider = await getProvider()
      const contract = getContract(provider)
      
      const args = inputs.map(input => functionInputs[\`\${funcName}_\${input.name}\`] || '')
      const result = await contract[funcName](...args)
      
      setFunctionOutputs(prev => ({
        ...prev,
        [funcName]: result.toString()
      }))
    } catch (err: any) {
      console.error(\`Read error (\${funcName}):\`, err)
      setFunctionOutputs(prev => ({
        ...prev,
        [funcName]: \`Error: \${err.reason || err.message}\`
      }))
    }
  }

  
  const handleWrite = async (funcName: string, inputs: any[]) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const provider = await getProvider()
      const signer = await provider.getSigner()
      const contract = getContract(signer)
      
      const args = inputs.map(input => {
        const val = functionInputs[\`\${funcName}_\${input.name}\`] || ''
        
        return val
      })
      
      const tx = await contract[funcName](...args)
      setSuccess(\`Transaction submitted! Hash: \${tx.hash}\`)
      setTxHash(tx.hash)
      
      await tx.wait()
      setSuccess(\`Function \${funcName} executed successfully!\`)
      await loadBalance()
    } catch (err: any) {
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
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
      ${mintAcceptsAmount ? 'setMintAmount(\\\'\\\')' : ''}
    } catch (err: any) {
      setError(err.message || 'Mint transaction failed')
      console.error('Mint error:', err)
    } finally {
      setLoading(false)
    }
  }` : ''}

   ${canBurn ? `
  const handleBurn = async () => {
     if (!burnAmount) return
      await handleTransaction(
      async () => {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const contract = getContract(signer)
        return await contract.burn(ethers.parseEther(burnAmount))
      },
      'Burned tokens successfully!'
    )
    setBurnAmount('')
  }`: ''}

   ${canTransfer ? `
  const handleTransfer = async () => {
    if (!transferTo || !transferAmount) return
     await handleTransaction(
      async () => {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const contract = getContract(signer)
        return await contract.transfer(transferTo, ethers.parseEther(transferAmount))
      },
      'Transferred tokens successfully!'
    )
     setTransferTo('')
     setTransferAmount('')
  }`: ''}

   ${canApprove ? `
  const handleApprove = async () => {
    if (!approveSpender || !approveAmount) return
     await handleTransaction(
      async () => {
        const provider = await getProvider()
        const signer = await provider.getSigner()
        const contract = getContract(signer)
        return await contract.approve(approveSpender, ethers.parseEther(approveAmount))
      },
      'Approved tokens successfully!'
    )
     setApproveSpender('')
     setApproveAmount('')
  }`: ''}

  return (
    <div className="space-y-8 animate-fade-in">
      {}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-sm">
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

      {}
      <div className="grid md:grid-cols-2 gap-6">
        ${canBalanceOf ? `
        <div className="card bg-slate-900/60 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-200">Your Balance</h3>
            <Activity size={20} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-mono text-white mb-2">{balance}</p>
          <button onClick={loadBalance} className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            Refresh Balance
          </button>
        </div>` : ''}

        ${canMint ? `
        <div className="card bg-slate-900/60 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-lg text-slate-200">Mint Tokens</h3>
             <Play size={20} className="text-green-400" />
          </div>
          ${mintAcceptsAmount ? `
          <input
            type="number"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg mb-4 focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
            disabled={loading}
          />` : ''}
          <button 
            onClick={handleMint}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Minting...' : 'Mint'}
          </button>
        </div>` : ''}

        ${canBurn ? `
         <div className="card bg-slate-900/60 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-lg text-slate-200">Burn Tokens</h3>
             <Play size={20} className="text-red-400" />
          </div>
          <input
            type="number"
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg mb-4 focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
            disabled={loading}
          />
          <button 
            onClick={handleBurn}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Burning...' : 'Burn'}
          </button>
        </div>` : ''}
        
         ${canTransfer ? `
         <div className="card bg-slate-900/60 border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-lg text-slate-200">Transfer</h3>
             <Play size={20} className="text-blue-400" />
          </div>
          <input
            type="text"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            placeholder="Recipient Address"
            className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            disabled={loading}
          />
           <input
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Amount"
            className="w-full px-4 py-2 bg-slate-800 border-slate-700 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            disabled={loading}
          />
          <button 
            onClick={handleTransfer}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </button>
        </div>` : ''}
      </div>

       {}
      ${customReadFunctions.length > 0 ? `
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="text-purple-400" size={24} />
          Read Data
        </h3>
        <div className="space-y-4">
          ${customReadFunctions.map((func: any) => `
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <button 
              onClick={() => toggleFunction('${func.name}')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="font-mono text-purple-300 font-medium">${func.name}</div>
              <ChevronDown size={18} className={\`text-slate-500 transition-transform duration-200 \${expandedFunctions['${func.name}'] ? 'rotate-180' : ''}\`} />
            </button>
            
            {expandedFunctions['${func.name}'] && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                ${func.inputs.length > 0 ? `
                <div className="grid gap-3 mb-4">
                  ${func.inputs.map((input: any) => `
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">${input.name} (${input.type})</label>
                    <input 
                      type="text" 
                      placeholder="${input.name}" 
                      className="w-full px-3 py-2 bg-slate-800 text-sm border-slate-700 rounded-lg focus:border-purple-500"
                      onChange={(e) => handleInputChange('${func.name}', '${input.name}', e.target.value)}
                    />
                  </div>`).join('')}
                </div>` : ''}
                
                <button 
                  onClick={() => handleRead('${func.name}', ${JSON.stringify(func.inputs)})}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-sm transition-colors"
                >
                  Query
                </button>
                
                {functionOutputs['${func.name}'] && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Result:</div>
                    <div className="font-mono text-sm text-green-400 break-all">
                      {functionOutputs['${func.name}']}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>`).join('')}
        </div>
      </div>` : ''}

      {}
      ${customWriteFunctions.length > 0 ? `
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Play className="text-orange-400" size={24} />
          Execute Actions
        </h3>
         <div className="space-y-4">
          ${customWriteFunctions.map((func: any) => `
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
             <button 
              onClick={() => toggleFunction('${func.name}')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className="font-mono text-orange-300 font-medium">${func.name}</div>
              <ChevronDown size={18} className={\`text-slate-500 transition-transform duration-200 \${expandedFunctions['${func.name}'] ? 'rotate-180' : ''}\`} />
            </button>
            
            {expandedFunctions['${func.name}'] && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                 ${func.inputs.length > 0 ? `
                <div className="grid gap-3 mb-4">
                  ${func.inputs.map((input: any) => `
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">${input.name} (${input.type})</label>
                    <input 
                      type="text" 
                      placeholder="${input.name}" 
                      className="w-full px-3 py-2 bg-slate-800 text-sm border-slate-700 rounded-lg focus:border-orange-500"
                      onChange={(e) => handleInputChange('${func.name}', '${input.name}', e.target.value)}
                    />
                  </div>`).join('')}
                </div>` : ''}
                
                <button 
                  onClick={() => handleWrite('${func.name}', ${JSON.stringify(func.inputs)})}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Executing...' : 'Execute Transaction'}
                </button>
              </div>
            )}
          </div>`).join('')}
        </div>
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
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https:
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
    "ethers": "^6.13.4",
    "lucide-react": "^0.473.0"
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
  return `
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

function generateTailwindConfig(): string {
  return `
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
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
NEXT_PUBLIC_BLOCK_EXPLORER_URL=${contract.explorerUrl || 'https://celoscan.io'}
\`\`\`

### Run locally

\`\`\`bash
npm run dev
\`\`\`
`
}
