"use client"

import { X, Code, Eye, Wallet, ExternalLink, Copy } from "lucide-react"
import { useState } from "react"
import { CELO_NETWORKS } from "@/lib/celo-config"

interface ContractPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  contract: {
    contractAddress: string
    contractName: string
    tokenName?: string
    tokenSymbol?: string
    network: "sepolia" | "mainnet"
    networkName: string
    contractType: "erc20" | "nft"
    abi?: any[]
    solidityCode?: string
    blocks?: any[]
  }
  walletAddress?: string | null
}

export function ContractPreviewModal({ isOpen, onClose, contract, walletAddress }: ContractPreviewModalProps) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview")
  const [iframeKey, setIframeKey] = useState(0)

  if (!isOpen) return null

  const isNFT = contract.contractType === "nft"
  const networkConfig = CELO_NETWORKS[contract.network]

  
  const features: string[] = []
  const blocks = contract.blocks && Array.isArray(contract.blocks) ? contract.blocks : []

  
  console.log('=== ContractPreviewModal Debug (from Supabase) ===')
  console.log('Contract object received:', {
    name: contract.contractName,
    address: contract.contractAddress,
    type: contract.contractType,
    hasBlocks: !!contract.blocks,
    blocksArray: contract.blocks,
    blocksLength: blocks.length,
    blockTypes: blocks.map((b: any) => b.type),
    blockTypesString: JSON.stringify(blocks.map((b: any) => b.type)),
    hasSolidityCode: !!contract.solidityCode,
    solidityCodeLength: contract.solidityCode?.length || 0,
  })
  console.log('Wallet address received:', walletAddress)
  console.log('Raw blocks data:', JSON.stringify(blocks, null, 2))
  console.log('===========================================')

  if (blocks && Array.isArray(blocks) && blocks.length > 0) {
    
    const hasFeature = (type: string) => blocks?.some((b: any) => {
      const blockType = (b.type || '').toLowerCase()
      return blockType === type.toLowerCase()
    })

    console.log('🔍 Checking for features in blocks:')
    blocks.forEach((b: any, i: number) => {
      console.log(`  Block ${i}: type="${b.type}", label="${b.label}"`)
    })

    
    if (hasFeature("transfer")) { features.push("Transfer"); console.log('  ✓ Found transfer block') }
    if (hasFeature("mint")) { features.push("Mint"); console.log('  ✓ Found mint block') }
    if (hasFeature("burn")) { features.push("Burn"); console.log('  ✓ Found burn block') }
    if (hasFeature("stake")) { features.push("Stake"); console.log('  ✓ Found stake block') }
    if (hasFeature("withdraw")) { features.push("Withdraw"); console.log('  ✓ Found withdraw block') }
    if (hasFeature("pausable")) { features.push("Pause/Unpause"); console.log('  ✓ Found pausable block') }
    if (hasFeature("whitelist")) { features.push("Whitelist"); console.log('  ✓ Found whitelist block') }
    if (hasFeature("blacklist")) { features.push("Blacklist"); console.log('  ✓ Found blacklist block') }
    if (hasFeature("royalty")) { features.push("Royalties"); console.log('  ✓ Found royalty block') }
    if (hasFeature("airdrop")) { features.push("Airdrop"); console.log('  ✓ Found airdrop block') }
    if (hasFeature("voting")) { features.push("Voting"); console.log('  ✓ Found voting block') }
    if (hasFeature("snapshot")) { features.push("Snapshot"); console.log('  ✓ Found snapshot block') }
    if (hasFeature("timelock")) { features.push("Timelock"); console.log('  ✓ Found timelock block') }
    if (hasFeature("multisig")) { features.push("MultiSig"); console.log('  ✓ Found multisig block') }
    if (hasFeature("permit")) { features.push("Gasless Approval"); console.log('  ✓ Found permit block') }
  } else {
    console.log('❌ No blocks found or blocks is not an array')
    console.log('  blocks type:', typeof blocks)
    console.log('  isArray?:', Array.isArray(blocks))
    console.log('  length:', blocks?.length)
  }

  console.log('Features extracted:', features)

  const generateFeatureUI = (feature: string) => {
    switch (feature) {
      case "Transfer":
        return isNFT
          ? `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
             <input type="number" placeholder="Token ID" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
             <button onclick="executeTransfer(event)" class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">📤 Transfer NFT</button>`
          : `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
             <input type="number" placeholder="Amount" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none">
             <button onclick="executeTransfer(event)" class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">📤 Transfer Tokens</button>`

      case "Mint":
        return isNFT
          ? `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none">
             <button onclick="executeMint(event)" class="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">🎨 Mint NFT</button>`
          : `<input type="text" placeholder="Recipient Address (optional)" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none">
             <input type="number" placeholder="Amount" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none">
             <button onclick="executeMint(event)" class="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">💰 Mint Tokens</button>`

      case "Burn":
        return `<input type="number" placeholder="Amount to Burn" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
                <button onclick="executeBurn(event)" class="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-red-500/30">🔥 Burn Tokens</button>`

      case "Stake":
        return `<input type="number" placeholder="Amount to Stake" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none">
                <div class="text-sm text-slate-400 mb-3">📈 APY: 365% (1% daily)</div>
                <button onclick="executeStake(event)" class="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30">⭐ Stake Tokens</button>`

      case "Withdraw":
        return `<div class="text-sm text-slate-400 mb-3">💰 Contract Balance: <span class="text-green-400 font-bold">0 CELO</span></div>
                <button onclick="executeWithdraw(event)" class="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">💸 Withdraw</button>`

      case "Pause/Unpause":
        return `<div class="text-sm text-slate-400 mb-3">Status: <span class="text-green-400 font-medium">Active</span></div>
                <div class="flex gap-2">
                  <button onclick="executePause()" class="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30">⏸️ Pause</button>
                  <button onclick="executeUnpause()" class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30">▶️ Unpause</button>
                </div>`

      case "Whitelist":
        return `<input type="text" placeholder="Address to Whitelist" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                <button onclick="executeWhitelist(event)" class="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30">✅ Add to Whitelist</button>`

      case "Blacklist":
        return `<input type="text" placeholder="Address to Blacklist" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
                <button onclick="executeBlacklist(event)" class="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-red-500/30">🚫 Blacklist Address</button>`

      case "Royalties":
        return `<div class="text-sm text-slate-400 mb-2">👑 Current Royalty Rate: <span class="text-purple-400 font-bold">2.5%</span></div>
                <input type="text" placeholder="Royalty Receiver Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none">
                <input type="number" placeholder="Percentage (250 = 2.5%)" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none">
                <button onclick="executeRoyalty(event)" class="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30">🎵 Update Royalty</button>`

      case "Airdrop":
        return `<textarea placeholder="Addresses (one per line)" rows="2" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"></textarea>
                <input type="number" placeholder="Amount per address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none">
                <button onclick="executeAirdrop(event)" class="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30">✈️ Airdrop Tokens</button>`

      case "Voting":
        return `<input type="text" placeholder="Proposal Description" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
                <button onclick="executeCreateProposal(event)" class="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 mb-2">🗳️ Create Proposal</button>
                <div class="flex gap-2">
                  <button onclick="executeVote(true)" class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105">👍 Vote For</button>
                  <button onclick="executeVote(false)" class="flex-1 px-3 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105">👎 Vote Against</button>
                </div>`

      case "Snapshot":
        return `<div class="text-sm text-slate-400 mb-3">📸 Current Snapshot ID: <span class="text-cyan-400 font-bold">0</span></div>
                <button onclick="executeSnapshot(event)" class="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30">📷 Take Snapshot</button>`

      case "Timelock":
        return `<div class="text-sm text-slate-400 mb-2">⏰ Lock Duration: <span class="text-orange-400 font-bold">2 days</span></div>
                <input type="number" placeholder="New Duration (seconds)" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none">
                <button onclick="executeTimelock(event)" class="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30">🔒 Set Duration</button>`

      case "MultiSig":
        return `<div class="text-sm text-slate-400 mb-3">🔐 Multi-signature required for critical operations</div>
                <input type="text" placeholder="Transaction Data" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none">
                <button onclick="executeAction('submitMultiSig')" class="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30">📝 Submit for Approval</button>`

      case "Gasless Approval":
        return `<div class="text-sm text-slate-400 mb-3">⛽ Approve tokens without paying gas (EIP-2612)</div>
                <input type="text" placeholder="Spender Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                <input type="number" placeholder="Amount to Approve" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none">
                <button onclick="executeAction('permitApprove')" class="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-teal-500/30">✍️ Sign Permit</button>`

      default:
        return `<button onclick="executeAction('${feature}')" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Execute ${feature}</button>`
    }
  }

  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
        <title>${contract.contractName} dApp</title>
        <style>
          @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.5s ease-out; }
        </style>
      </head>
      <body class="bg-gradient-to-br from-slate-900 to-slate-800">
        <div class="min-h-screen p-8">
          <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h1 class="text-4xl font-bold text-white mb-2">${contract.contractName}</h1>
                  <p class="text-slate-400">${isNFT ? 'NFT Collection' : 'Token'} (${contract.tokenSymbol || 'TOKEN'})</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-slate-500">Network</div>
                  <div class="text-cyan-400 font-medium">${contract.networkName}</div>
                </div>
              </div>
              
              <!-- Contract Address -->
              <div class="p-4 bg-slate-900/50 rounded-lg border border-slate-600 mb-4">
                <div class="text-xs text-slate-500 mb-1">Contract Address</div>
                <div class="font-mono text-cyan-400 text-sm break-all">${contract.contractAddress}</div>
              </div>

              <div class="flex gap-3">
                <button 
                  onclick="connectWallet()"
                  id="connectBtn"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/50"
                >
                  🦊 Connect Wallet
                </button>
                <button 
                  onclick="openExplorer()"
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                >
                  🔍 View on Explorer
                </button>
              </div>
            </div>

            <!-- Features Grid -->
            ${features.length > 0 ? `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              ${features.map((feature) => `
                <div class="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-cyan-500 transition-all">
                  <h3 class="text-xl font-bold text-white mb-4">${feature}</h3>
                  ${generateFeatureUI(feature)}
                </div>
              `).join('')}
            </div>
            ` : `
            <div class="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-6 text-center">
              <p class="text-slate-400">This is a basic ${isNFT ? 'NFT' : 'token'} contract with standard functionality.</p>
              <p class="text-slate-500 text-sm mt-2">Transfer and approve operations are available through the contract directly.</p>
            </div>
            `}

            <!-- Contract Stats -->
            <div class="bg-slate-800 rounded-lg border border-slate-700 p-8">
              <h3 class="text-2xl font-bold text-white mb-6">Contract Statistics</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div class="text-sm text-slate-500 mb-1">Total Supply</div>
                  <div class="text-2xl font-bold text-white" id="totalSupply">${isNFT ? '0 NFTs' : 'Loading...'}</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 mb-1">Holders</div>
                  <div class="text-2xl font-bold text-white">-</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 mb-1">Network</div>
                  <div class="text-2xl font-bold text-cyan-400">${contract.network === 'mainnet' ? 'Mainnet' : 'Testnet'}</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 mb-1">Your Balance</div>
                  <div class="text-2xl font-bold text-cyan-400" id="userBalance">0</div>
                </div>
              </div>
            </div>

            <!-- Contract Blocks Info -->
            <div class="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-8">
              <h3 class="text-xl font-bold text-white mb-4">Contract Blocks (${features.length})</h3>
              ${features.length > 0
        ? `<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                   ${features.map((feature) => `
                     <div class="bg-slate-700/50 rounded-lg p-3 border border-slate-600 text-center">
                       <div class="text-sm font-semibold text-cyan-400">${feature}</div>
                     </div>
                   `).join('')}
                 </div>`
        : `<p class="text-slate-400 text-sm">Standard contract with basic functionality (Transfer, Approve)</p>`}
            </div>

            <!-- Footer -->
            <div class="mt-6 text-center text-slate-500 text-sm">
              Built with Block Builder 🚀
            </div>
          </div>
        </div>

        <script>
          let provider = null;
          let signer = null;
          let userAddress = null;
          let contract = null;
          
          const CONTRACT_ADDRESS = "${contract.contractAddress}";
          const EXPLORER_URL = "${networkConfig.explorerUrl}";
          const PASSED_WALLET = '${walletAddress || ''}';
          
          // Helper function to get ethereum provider (works in iframe)
          function getEthereum() {
            // Try iframe's own window first
            if (typeof window.ethereum !== 'undefined') {
              return window.ethereum;
            }
            // Try parent window (for sandboxed iframes)
            try {
              if (window.parent && typeof window.parent.ethereum !== 'undefined') {
                return window.parent.ethereum;
              }
            } catch (e) {
              console.log('Cannot access parent ethereum:', e.message);
            }
            // Try top window
            try {
              if (window.top && typeof window.top.ethereum !== 'undefined') {
                return window.top.ethereum;
              }
            } catch (e) {
              console.log('Cannot access top ethereum:', e.message);
            }
            return null;
          }
          
          // Generate fallback ABI based on contract features
          function generateFallbackABI() {
            const abi = [
              // Basic ERC20 functions
              { "inputs": [{"name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
              { "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
              { "inputs": [], "name": "name", "outputs": [{"name": "", "type": "string"}], "stateMutability": "view", "type": "function" },
              { "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "stateMutability": "view", "type": "function" },
              { "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "stateMutability": "view", "type": "function" },
              { "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function" },
              { "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function" },
            ];
            
            const features = ${JSON.stringify(features)};
            
            // Add feature-specific functions
            if (features.includes('Mint')) {
              abi.push({ "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Burn')) {
              abi.push({ "inputs": [{"name": "amount", "type": "uint256"}], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Stake')) {
              abi.push({ "inputs": [{"name": "amount", "type": "uint256"}], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
              abi.push({ "inputs": [{"name": "account", "type": "address"}], "name": "stakedBalance", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" });
            }
            if (features.includes('Withdraw')) {
              abi.push({ "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Pause/Unpause')) {
              abi.push({ "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
              abi.push({ "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
              abi.push({ "inputs": [], "name": "paused", "outputs": [{"name": "", "type": "bool"}], "stateMutability": "view", "type": "function" });
            }
            if (features.includes('Whitelist')) {
              abi.push({ "inputs": [{"name": "account", "type": "address"}], "name": "addToWhitelist", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
              abi.push({ "inputs": [{"name": "account", "type": "address"}], "name": "removeFromWhitelist", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Blacklist')) {
              abi.push({ "inputs": [{"name": "account", "type": "address"}], "name": "addToBlacklist", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
              abi.push({ "inputs": [{"name": "account", "type": "address"}], "name": "removeFromBlacklist", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Airdrop')) {
              abi.push({ "inputs": [{"name": "recipients", "type": "address[]"}, {"name": "amounts", "type": "uint256[]"}], "name": "airdrop", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Voting')) {
              abi.push({ "inputs": [{"name": "description", "type": "string"}, {"name": "duration", "type": "uint256"}], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
              abi.push({ "inputs": [{"name": "proposalId", "type": "uint256"}, {"name": "support", "type": "bool"}], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Snapshot')) {
              abi.push({ "inputs": [], "name": "snapshot", "outputs": [{"name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Timelock')) {
              abi.push({ "inputs": [{"name": "duration", "type": "uint256"}], "name": "setTimelockDuration", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            if (features.includes('Royalties')) {
              abi.push({ "inputs": [{"name": "receiver", "type": "address"}, {"name": "feeNumerator", "type": "uint96"}], "name": "setRoyaltyInfo", "outputs": [], "stateMutability": "nonpayable", "type": "function" });
            }
            
            return abi;
          }
          
          // Use the actual contract ABI from Supabase, or generate fallback
          console.log('📋 Loading contract ABI...');
          let CONTRACT_ABI = ${JSON.stringify(contract.abi || [])};
          
          // If ABI is empty, use fallback
          if (!CONTRACT_ABI || CONTRACT_ABI.length === 0) {
            console.warn('⚠️ No ABI from Supabase, generating fallback ABI based on features');
            CONTRACT_ABI = generateFallbackABI();
            console.log('✅ Generated fallback ABI with', CONTRACT_ABI.length, 'functions');
          }
          
          console.log('✓ ABI loaded:', CONTRACT_ABI.length, 'functions/events');
          console.log('📋 ABI Details:', {
            total: CONTRACT_ABI.length,
            functions: CONTRACT_ABI.filter(item => item.type === 'function').length,
            events: CONTRACT_ABI.filter(item => item.type === 'event').length,
            constructor: CONTRACT_ABI.filter(item => item.type === 'constructor').length,
            fallback: CONTRACT_ABI.filter(item => item.type === 'fallback').length,
          });

          function openExplorer() {
            window.open(EXPLORER_URL + '/address/' + CONTRACT_ADDRESS, '_blank');
            showNotification('🔍 Opening Explorer...', 'info');
          }

          async function connectWallet() {
            console.log('🔌 Connect Wallet button clicked');
            // Ensure ethers is loaded
            if (typeof ethers === 'undefined') {
              console.log('⏳ ethers.js not loaded yet, retrying...');
              showNotification('⏳ Loading Web3 libraries...', 'info');
              setTimeout(connectWallet, 500);
              return;
            }

            const ethereum = getEthereum();
            console.log('✓ ethers.js is loaded');
            console.log('  Current userAddress:', userAddress);
            console.log('  ethereum available:', !!ethereum);

            if (userAddress) {
              console.log('ℹ️ Wallet already connected:', userAddress);
              showNotification('ℹ️ Wallet already connected!\\n\\n' + userAddress.slice(0, 6) + '...' + userAddress.slice(-4), 'info');
              return;
            }

            if (!ethereum) {
              console.error('⚠️ No Web3 wallet detected');
              showNotification('⚠️ Please install MetaMask or another Web3 wallet!', 'warning');
              return;
            }

            try {
              console.log('📱 Requesting wallet accounts...');
              // Request accounts with proper error handling
              const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
              console.log('📱 Accounts returned:', accounts);
              
              if (!accounts || accounts.length === 0) {
                console.error('⚠️ No accounts available');
                showNotification('⚠️ No accounts available', 'warning');
                return;
              }

              console.log('🔧 Creating provider and signer...');
              provider = new ethers.providers.Web3Provider(ethereum);
              signer = provider.getSigner();
              userAddress = await signer.getAddress();
              console.log('✅ Connected address:', userAddress);
              
              contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
              console.log('✅ Contract instance created');
              
              const btn = document.getElementById('connectBtn');
              if (btn) {
                btn.textContent = '✅ ' + userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
                btn.classList.remove('from-cyan-500', 'to-blue-600', 'hover:from-cyan-400', 'hover:to-blue-500');
                btn.classList.add('bg-green-600', 'hover:bg-green-500');
              }
              
              await updateBalance();
              showNotification('✅ Wallet connected successfully!\\n' + userAddress.slice(0, 10) + '...', 'success');
            } catch (error) {
              console.error('❌ Connection error:', error);
              showNotification('❌ ' + error.message, 'error');
            }
          }

          // Auto-connect on page load if wallet is available
          async function autoConnect() {
            // Wait for ethers to be available
            if (typeof ethers === 'undefined') {
              setTimeout(autoConnect, 200);
              return;
            }
            const ethereum = getEthereum();
            if (!ethereum) {
              // MetaMask/wallet not installed
              console.log('⚠️ No wallet detected');
              console.log('PASSED_WALLET value:', PASSED_WALLET);
              return;
            }
            if (userAddress && contract) return; // Already connected
            
            try {
              // Check if already connected
              const accounts = await ethereum.request({ method: 'eth_accounts' });
              console.log('📱 Wallet accounts available:', accounts);
              console.log('📱 PASSED_WALLET from parent:', PASSED_WALLET);
              
              if (accounts && accounts.length > 0) {
                try {
                  provider = new ethers.providers.Web3Provider(ethereum);
                  signer = provider.getSigner();
                  userAddress = await signer.getAddress();
                  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                  
                  const btn = document.getElementById('connectBtn');
                  if (btn) {
                    btn.textContent = '✅ ' + userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
                    btn.classList.remove('from-cyan-500', 'to-blue-600', 'hover:from-cyan-400', 'hover:to-blue-500');
                    btn.classList.add('bg-green-600', 'hover:bg-green-500');
                  }
                  
                  await updateBalance();
                  console.log('✅ Auto-connected with wallet:', userAddress);
                  // Log that we received wallet from parent
                  if (PASSED_WALLET && PASSED_WALLET !== userAddress) {
                    console.log('⚠️ Parent wallet address provided:', PASSED_WALLET, 'but connected to:', userAddress);
                  } else if (PASSED_WALLET && PASSED_WALLET === userAddress) {
                    console.log('✅ Connected wallet matches parent wallet:', PASSED_WALLET);
                  }
                } catch (err) {
                  console.error('❌ Failed to initialize provider:', err);
                }
              } else if (PASSED_WALLET) {
                // No accounts detected, but we have a passed wallet - try to use it
                console.log('ℹ️ No current accounts, but parent provided:', PASSED_WALLET);
              }
            } catch (e) { 
              console.error('❌ Auto-connect check failed:', e); 
            }
          }

          // Run auto-connect when ethers library is loaded
          async function initAutoConnect() {
            if (typeof ethers === 'undefined') {
              // Try again if ethers not loaded yet
              setTimeout(initAutoConnect, 200);
            } else {
              autoConnect();
            }
          }

          // Start auto-connect initialization
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAutoConnect);
          } else {
            setTimeout(initAutoConnect, 100);
          }

          // Also listen for wallet connections
          (function setupWalletListeners() {
            const ethereum = getEthereum();
            if (ethereum && ethereum.on) {
              ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                  userAddress = null;
                  const btn = document.getElementById('connectBtn');
                  if (btn) {
                    btn.textContent = '🦊 Connect Wallet';
                    btn.classList.remove('bg-green-600', 'hover:bg-green-500');
                    btn.classList.add('from-cyan-500', 'to-blue-600', 'hover:from-cyan-400', 'hover:to-blue-500');
                  }
                  showNotification('Wallet disconnected', 'info');
                } else {
                  // Account changed, reconnect
                  userAddress = null;
                  autoConnect();
                }
              });
            }
          })();

          async function updateBalance() {
            if (!contract || !userAddress) return;
            try {
              const balance = await contract.balanceOf(userAddress);
              const formattedBalance = ethers.utils.formatEther(balance);
              const balanceElement = document.getElementById('userBalance');
              if (balanceElement) {
                balanceElement.textContent = parseFloat(formattedBalance).toFixed(4);
              }
            } catch (e) { 
              console.error('Failed to fetch balance:', e);
              const balanceElement = document.getElementById('userBalance');
              if (balanceElement) {
                balanceElement.textContent = '0';
              }
            }
          }

          async function executeTransfer(event) {
            console.log('🔘 Transfer button clicked');
            if (!userAddress || !contract) { 
              showNotification('⚠️ Connect wallet first!', 'warning'); 
              return; 
            }
            const card = event.target.closest('.bg-slate-800');
            const inputs = card.querySelectorAll('input');
            const to = inputs[0]?.value;
            const amount = inputs[1]?.value || '0';
            
            if (!to) {
              showNotification('❌ Enter recipient address', 'error');
              return;
            }
            
            try {
              showNotification('🔄 Transferring...', 'info');
              console.log('📤 Calling transfer with:', { to, amount });
              const tx = await contract.transfer(to, ethers.utils.parseEther(amount));
              console.log('✅ Transaction sent:', tx.hash);
              await tx.wait();
              showNotification('✅ Transfer successful!', 'success');
              await updateBalance();
            } catch (e) { 
              console.error('❌ Transfer error:', e);
              showNotification('❌ ' + e.message, 'error'); 
            }
          }

          async function executeMint(event) {
            console.log('🔘 Mint button clicked');
            console.log('  userAddress:', userAddress);
            console.log('  contract object:', contract);
            if (!userAddress || !contract) { 
              console.warn('⚠️ Cannot mint: wallet not connected or contract not initialized');
              showNotification('⚠️ Connect wallet first!', 'warning'); 
              return; 
            }
            const card = event.target.closest('.bg-slate-800');
            const inputs = card.querySelectorAll('input');
            try {
              showNotification('🔄 Minting...', 'info');
              const to = inputs[0]?.value || userAddress;
              const amount = inputs[1]?.value || '1';
              console.log('📤 Calling mint with:', { to, amount });
              const tx = await contract.mint(to, ethers.utils.parseEther(amount));
              console.log('✅ Transaction sent:', tx.hash);
              await tx.wait();
              showNotification('✅ Minted successfully!', 'success');
              await updateBalance();
            } catch (e) { 
              console.error('❌ Mint error:', e);
              showNotification('❌ ' + e.message, 'error'); 
            }
          }

          async function executeBurn(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const amount = card.querySelector('input')?.value || '0';
            try {
              showNotification('🔄 Burning...', 'info');
              const tx = await contract.burn(ethers.utils.parseEther(amount));
              await tx.wait();
              showNotification('✅ Burned successfully!', 'success');
              await updateBalance();
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeStake(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const amount = card.querySelector('input')?.value || '0';
            try {
              showNotification('🔄 Staking...', 'info');
              const tx = await contract.stake(ethers.utils.parseEther(amount));
              await tx.wait();
              showNotification('✅ Staked successfully!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeWithdraw() {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            try {
              showNotification('🔄 Withdrawing...', 'info');
              const tx = await contract.withdraw();
              await tx.wait();
              showNotification('✅ Withdrawn successfully!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executePause() {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            try {
              const tx = await contract.pause();
              await tx.wait();
              showNotification('✅ Contract paused!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeUnpause() {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            try {
              const tx = await contract.unpause();
              await tx.wait();
              showNotification('✅ Contract unpaused!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeWhitelist(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const address = card.querySelector('input')?.value;
            if (!address) { showNotification('❌ Enter an address', 'error'); return; }
            try {
              const tx = await contract.addToWhitelist(address);
              await tx.wait();
              showNotification('✅ Added to whitelist!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeBlacklist(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const address = card.querySelector('input')?.value;
            if (!address) { showNotification('❌ Enter an address', 'error'); return; }
            try {
              const tx = await contract.addToBlacklist(address);
              await tx.wait();
              showNotification('✅ Blacklisted!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeRoyalty(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const inputs = card.querySelectorAll('input');
            try {
              const tx = await contract.setRoyaltyInfo(inputs[0].value, inputs[1].value);
              await tx.wait();
              showNotification('✅ Royalty updated!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeAirdrop(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const addresses = card.querySelector('textarea')?.value.split('\\n').filter(a => a.trim());
            const amount = card.querySelector('input')?.value || '0';
            if (!addresses?.length) { showNotification('❌ Enter addresses', 'error'); return; }
            try {
              const amounts = addresses.map(() => ethers.utils.parseEther(amount));
              const tx = await contract.airdrop(addresses, amounts);
              await tx.wait();
              showNotification('✅ Airdrop complete!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeCreateProposal(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const description = card.querySelector('input')?.value;
            if (!description) { showNotification('❌ Enter description', 'error'); return; }
            try {
              const tx = await contract.createProposal(description, 86400);
              await tx.wait();
              showNotification('✅ Proposal created!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeVote(support) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const id = prompt('Enter Proposal ID:');
            if (!id) return;
            try {
              const tx = await contract.vote(id, support);
              await tx.wait();
              showNotification('✅ Vote submitted!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeSnapshot() {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            try {
              const tx = await contract.snapshot();
              await tx.wait();
              showNotification('✅ Snapshot taken!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          async function executeTimelock(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const duration = card.querySelector('input')?.value || '172800';
            try {
              const tx = await contract.setTimelockDuration(duration);
              await tx.wait();
              showNotification('✅ Timelock set!', 'success');
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
          }

          function executeAction(action) {
            showNotification('ℹ️ ' + action + ' feature', 'info');
          }

          function showNotification(message, type = 'info') {
            const existing = document.getElementById('notification');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-md animate-slide-in';
            
            let bgColor = 'bg-blue-500';
            if (type === 'success') bgColor = 'bg-green-500';
            else if (type === 'error') bgColor = 'bg-red-500';
            else if (type === 'warning') bgColor = 'bg-yellow-500';
            
            notification.className += ' ' + bgColor + ' text-white';
            notification.innerHTML = '<div class="whitespace-pre-line">' + message + '</div>';
            
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
          }

          // Also run auto-connect after a short delay to ensure ethers is loaded
          setTimeout(autoConnect, 500);
        </script>
      </body>
      </html>
    `
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
      <div className="bg-card rounded-lg border border-border w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {contract.contractName} Preview
            </h2>
            <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-500 rounded-full">
              {contract.networkName}
            </span>
            <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full">
              {contract.contractType.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-background rounded-lg p-1">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "preview"
                  ? "bg-primary text-background"
                  : "text-muted hover:text-foreground"
                  }`}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "code"
                  ? "bg-primary text-background"
                  : "text-muted hover:text-foreground"
                  }`}
              >
                <Code size={16} />
                Code
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-colors text-muted hover:text-foreground"
              title="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {viewMode === "preview" ? (
            <iframe
              key={iframeKey}
              srcDoc={generatePreviewHTML()}
              className="w-full h-full border-0"
              title="Contract dApp Preview"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals allow-forms"
            />
          ) : (
            <div className="h-full overflow-auto">
              <pre className="p-6 text-sm text-foreground bg-slate-900 h-full overflow-auto">
                <code>{contract.solidityCode || "// Solidity code not available"}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="px-4 py-2 bg-background hover:bg-border rounded text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              🔄 Refresh
            </button>
            <a
              href={`${networkConfig.explorerUrl}/address/${contract.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-background hover:bg-border rounded text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-2"
            >
              <ExternalLink size={14} />
              View on Explorer
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(contract.contractAddress)
                alert("Contract address copied!")
              }}
              className="px-4 py-2 bg-background hover:bg-border rounded text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-2"
            >
              <Copy size={14} />
              Copy Address
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-background rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
