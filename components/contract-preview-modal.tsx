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

    // Collect features from blocks
    const features: string[] = []
    if (contract.blocks) {
        const hasFeature = (type: string) => contract.blocks?.some((b: any) => b.type === type)
        if (hasFeature("mint")) features.push("Mint")
        if (hasFeature("burn")) features.push("Burn")
        if (hasFeature("stake")) features.push("Stake")
        if (hasFeature("withdraw")) features.push("Withdraw")
        if (hasFeature("pausable")) features.push("Pause/Unpause")
        if (hasFeature("whitelist")) features.push("Whitelist")
        if (hasFeature("blacklist")) features.push("Blacklist")
        if (hasFeature("royalty")) features.push("Royalties")
        if (hasFeature("airdrop")) features.push("Airdrop")
        if (hasFeature("voting")) features.push("Voting")
        if (hasFeature("snapshot")) features.push("Snapshot")
        if (hasFeature("timelock")) features.push("Timelock")
    }

    const generateFeatureUI = (feature: string) => {
        switch (feature) {
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
        <title>${contract.contractName} dApp</title>
        <style>
          @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
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

            <!-- Footer -->
            <div class="mt-6 text-center text-slate-500 text-sm">
              Built with Celo No-Code Builder 🚀
            </div>
          </div>
        </div>

        <script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js"></script>
        <script>
          let provider = null;
          let signer = null;
          let userAddress = null;
          let contract = null;
          
          const CONTRACT_ADDRESS = "${contract.contractAddress}";
          const EXPLORER_URL = "${networkConfig.explorerUrl}";
          const PASSED_WALLET = '${walletAddress || ''}';
          
          const CONTRACT_ABI = [
            "function mint(address to, uint256 amount) external",
            "function mint(address to) external",
            "function burn(uint256 amount) external",
            "function stake(uint256 amount) external",
            "function withdraw() external",
            "function pause() external",
            "function unpause() external",
            "function addToWhitelist(address account) external",
            "function addToBlacklist(address account) external",
            "function setRoyaltyInfo(address receiver, uint256 percentage) external",
            "function airdrop(address[] calldata recipients, uint256[] calldata amounts) external",
            "function snapshot() external returns (uint256)",
            "function createProposal(string memory description, uint256 votingPeriod) external returns (uint256)",
            "function vote(uint256 proposalId, bool support) external",
            "function setTimelockDuration(uint256 duration) external",
            "function balanceOf(address account) view returns (uint256)",
            "function totalSupply() view returns (uint256)",
            "function owner() view returns (address)"
          ];

          function openExplorer() {
            window.open(EXPLORER_URL + '/address/' + CONTRACT_ADDRESS, '_blank');
            showNotification('🔍 Opening Explorer...', 'info');
          }

          async function connectWallet() {
            if (userAddress) {
              showNotification('ℹ️ Wallet already connected!\\n\\n' + userAddress.slice(0, 6) + '...' + userAddress.slice(-4), 'info');
              return;
            }

            if (typeof window.ethereum === 'undefined') {
              showNotification('⚠️ Please install MetaMask!', 'warning');
              return;
            }

            try {
              provider = new ethers.providers.Web3Provider(window.ethereum);
              await provider.send("eth_requestAccounts", []);
              signer = provider.getSigner();
              userAddress = await signer.getAddress();
              
              contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
              
              document.getElementById('connectBtn').textContent = '✅ ' + userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
              document.getElementById('connectBtn').classList.add('bg-green-600');
              
              showNotification('✅ Wallet connected!', 'success');
              await updateBalance();
            } catch (error) {
              showNotification('❌ Connection failed: ' + error.message, 'error');
            }
          }

          // Auto-connect on page load if wallet is available
          async function autoConnect() {
            // Wait for ethers to be available
            if (typeof ethers === 'undefined') {
              setTimeout(autoConnect, 200);
              return;
            }
            if (typeof window.ethereum === 'undefined') return;
            if (userAddress && contract) return; // Already connected
            
            try {
              // Check if already connected
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0) {
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = await signer.getAddress();
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                
                const btn = document.getElementById('connectBtn');
                if (btn) {
                  btn.textContent = '✅ ' + userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
                  btn.classList.remove('from-cyan-500', 'to-blue-600');
                  btn.classList.add('bg-green-600');
                }
                
                await updateBalance();
              }
            } catch (e) { console.error('Auto-connect failed:', e); }
          }

          // Run auto-connect when page loads and also immediately
          window.addEventListener('load', autoConnect);
          // Also try immediately in case DOMContentLoaded already fired
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(autoConnect, 100);
          }

          async function updateBalance() {
            if (!contract || !userAddress) return;
            try {
              const balance = await contract.balanceOf(userAddress);
              document.getElementById('userBalance').textContent = ethers.utils.formatEther(balance);
            } catch (e) { console.error(e); }
          }

          async function executeMint(event) {
            if (!userAddress || !contract) { showNotification('⚠️ Connect wallet first!', 'warning'); return; }
            const card = event.target.closest('.bg-slate-800');
            const inputs = card.querySelectorAll('input');
            try {
              showNotification('🔄 Minting...', 'info');
              const to = inputs[0]?.value || userAddress;
              const amount = inputs[1]?.value || '1';
              const tx = await contract.mint(to, ethers.utils.parseEther(amount));
              await tx.wait();
              showNotification('✅ Minted successfully!', 'success');
              await updateBalance();
            } catch (e) { showNotification('❌ ' + e.message, 'error'); }
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
