"use client"

import { useBuilderStore } from "@/lib/store"
import { generateSolidityCode, generateTypeScriptCode } from "@/lib/code-generator"
import { X, Code, Eye } from "lucide-react"
import { useState } from "react"

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const blocks = useBuilderStore((state) => state.blocks)
  const walletAddress = useBuilderStore((state) => state.walletAddress)
  const [iframeKey, setIframeKey] = useState(0)
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview")

  if (!isOpen) return null

  const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")
  const hasFeature = (type: string) => blocks.some((b) => b.type === type)
  const solidityCode = generateSolidityCode(blocks)

  // Generate interactive preview based on blocks
  const generatePreviewHTML = () => {
    const contractName = baseBlock?.config?.name || "MyToken"
    const symbol = baseBlock?.config?.symbol || "MTK"
    const isNFT = baseBlock?.type === "nft"

    // Collect all features
    const features = []
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

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>${contractName} dApp Preview</title>
      </head>
      <body class="bg-gradient-to-br from-slate-900 to-slate-800">
        <div class="min-h-screen p-8">
          <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h1 class="text-4xl font-bold text-white mb-2">${contractName}</h1>
                  <p class="text-slate-400">${isNFT ? 'NFT Collection' : 'Token'} (${symbol})</p>
                  <p id="contractInfo" class="text-xs text-slate-500 mt-2">Loading contract...</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-slate-500">Network</div>
                  <div class="text-cyan-400 font-medium">Celo Sepolia</div>
                </div>
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
                  id="explorerBtn"
                  class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all transform hover:scale-110 hover:rotate-1 shadow-2xl shadow-purple-500/50 border-2 border-purple-400/30 backdrop-blur-sm relative overflow-hidden group"
                >
                  <span class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  <span class="relative flex items-center gap-2">
                    <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    View Contract on Explorer
                  </span>
                </button>
              </div>
            </div>
            
            <!-- Contract Address Card -->
            <div id="contractAddressCard" class="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border-2 border-purple-500/40 p-6 mb-6 backdrop-blur-sm shadow-xl hidden">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="text-sm text-purple-300 font-medium mb-2">📄 Smart Contract Address</div>
                  <div id="contractAddressDisplay" class="text-white font-mono text-lg bg-slate-800/50 px-4 py-3 rounded-lg border border-purple-500/30 break-all"></div>
                </div>
                <button 
                  onclick="copyContractAddress()"
                  class="ml-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                  title="Copy contract address"
                >
                  📋 Copy
                </button>
              </div>
              <div class="mt-4 flex gap-3">
                <a 
                  id="explorerLink"
                  href="#"
                  target="_blank"
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-center font-medium rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  � View on Celo Scan
                </a>
                <button 
                  onclick="verifyContract()"
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  ✅ Verify Contract
                </button>
              </div>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              ${features.map((feature, index) => `
                <div class="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-cyan-500 transition-all">
                  <h3 class="text-xl font-bold text-white mb-4">${feature}</h3>
                  ${generateFeatureUI(feature, isNFT)}
                </div>
              `).join('')}
            </div>

            <!-- Contract Stats -->
            <div class="bg-slate-800 rounded-lg border border-slate-700 p-8">
              <h3 class="text-2xl font-bold text-white mb-6">Contract Statistics</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div class="text-sm text-slate-500 mb-1">Total Supply</div>
                  <div class="text-2xl font-bold text-white">${isNFT ? '0 NFTs' : '1M'}</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 mb-1">Holders</div>
                  <div class="text-2xl font-bold text-white">0</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 mb-1">Transactions</div>
                  <div class="text-2xl font-bold text-white">0</div>
                </div>
                <div>
                  <div class="text-sm text-slate-500 mb-1">Your Balance</div>
                  <div class="text-2xl font-bold text-cyan-400">0</div>
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
          let walletAddress = '${walletAddress || ''}';
          let contract = null;
          
          // Get deployed contract address from localStorage
          let CONTRACT_ADDRESS = localStorage.getItem('deployedContractAddress') || "0x0000000000000000000000000000000000000000";
          
          // Simple ABI - add functions as needed
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

          // Update contract info on page load
          window.addEventListener('DOMContentLoaded', () => {
            const contractInfo = document.getElementById('contractInfo');
            const contractAddressCard = document.getElementById('contractAddressCard');
            const contractAddressDisplay = document.getElementById('contractAddressDisplay');
            const explorerLink = document.getElementById('explorerLink');
            
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              contractInfo.textContent = '📄 Contract: ' + CONTRACT_ADDRESS.slice(0, 10) + '...' + CONTRACT_ADDRESS.slice(-8);
              contractInfo.classList.remove('text-slate-500');
              contractInfo.classList.add('text-green-400');
              
              // Show contract address card
              contractAddressCard.classList.remove('hidden');
              contractAddressDisplay.textContent = CONTRACT_ADDRESS;
              explorerLink.href = 'https://sepolia.celoscan.io/address/' + CONTRACT_ADDRESS;
            } else {
              contractInfo.textContent = '⚠️ No contract deployed - Deploy first from builder';
              contractInfo.classList.add('text-yellow-400');
            }
            
            // Auto-connect if wallet is already connected in navbar
            if (walletAddress) {
              autoConnectWallet();
            }
          });

          function openExplorer() {
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              const explorerUrl = 'https://sepolia.celoscan.io/address/' + CONTRACT_ADDRESS;
              window.open(explorerUrl, '_blank');
              showNotification('🔍 Opening Celo Scan Explorer...', 'info');
            } else {
              showNotification('⚠️ No contract deployed yet!\\n\\nDeploy your contract first from the builder page.', 'warning');
            }
          }

          function copyContractAddress() {
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
                showNotification('✅ Contract address copied!\\n\\n' + CONTRACT_ADDRESS, 'success');
                
                // Visual feedback
                const btn = event.target.closest('button');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✅ Copied!';
                btn.classList.add('bg-green-600');
                setTimeout(() => {
                  btn.innerHTML = originalText;
                  btn.classList.remove('bg-green-600');
                }, 2000);
              }).catch(err => {
                showNotification('❌ Failed to copy address', 'error');
              });
            }
          }

          function verifyContract() {
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              const verifyUrl = 'https://sepolia.celoscan.io/address/' + CONTRACT_ADDRESS + '#code';
              window.open(verifyUrl, '_blank');
              showNotification('📝 Opening verification page...\\n\\nYou can verify your contract source code on Celo Scan.', 'info');
            } else {
              showNotification('⚠️ No contract deployed yet!', 'warning');
            }
          }

          async function autoConnectWallet() {
            try {
              if (typeof window.ethereum === 'undefined' || !walletAddress) {
                return;
              }

              // Create provider and signer
              provider = new ethers.providers.Web3Provider(window.ethereum);
              signer = provider.getSigner();
              
              // Initialize contract
              if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                showNotification('✅ Wallet connected!\\n📄 Contract loaded', 'success');
              } else {
                showNotification('✅ Wallet connected: ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4) + '\\n⚠️ No contract deployed yet', 'warning');
              }
              
              // Update UI
              document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent.includes('Connect Wallet')) {
                  btn.textContent = '✅ ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
                  btn.classList.remove('bg-green-500', 'hover:bg-green-600');
                  btn.classList.add('bg-green-600');
                  btn.disabled = true;
                }
              });
              
              // Load balance if contract exists
              if (contract) {
                await updateBalance();
              }
            } catch (error) {
              console.error('Auto-connect error:', error);
            }
          }

          async function connectWallet() {
            // If wallet is already connected in navbar, just show message
            if (walletAddress) {
              showNotification('ℹ️ Wallet already connected from navbar!\\n\\n' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4), 'info');
              await autoConnectWallet();
              return;
            }

            // If not connected, prompt user to connect from navbar
            showNotification('⚠️ Please connect wallet from the navbar first!\\n\\nClick "Connect Wallet" in the top navigation bar.', 'warning');
          }

          async function updateBalance() {
            if (!contract || !walletAddress) return;
            
            try {
              const balance = await contract.balanceOf(walletAddress);
              const formattedBalance = ethers.utils.formatEther(balance);
              
              // Update balance display
              document.querySelectorAll('.text-green-400').forEach(el => {
                if (el.parentElement && el.parentElement.textContent.includes('Your Balance')) {
                  el.textContent = formattedBalance;
                }
              });
            } catch (error) {
              console.error('Balance update error:', error);
            }
          }

          async function executeMint(event) {
            const card = event.target.closest('.bg-slate-800');
            const addressInput = card.querySelector('input[placeholder*="Address"], input[placeholder*="Recipient"]');
            const amountInput = card.querySelector('input[type="number"]');
            
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!\\n\\nGo to builder and click "Deploy Contract"', 'warning');
              return;
            }
            
            try {
              const to = addressInput ? addressInput.value : walletAddress;
              const amount = amountInput ? amountInput.value : '1';
              
              if (!to || !amount) {
                showNotification('❌ Please fill in all fields', 'error');
                return;
              }
              
              showNotification('🔄 Minting tokens...', 'info');
              
              const tx = await contract.mint(to, ethers.utils.parseEther(amount));
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              
              await tx.wait();
              showNotification('✅ Tokens minted successfully!', 'success');
              
              await updateBalance();
            } catch (error) {
              console.error('Mint error:', error);
              showNotification('❌ Mint failed: ' + error.message, 'error');
            }
          }

          async function executeBurn(event) {
            const card = event.target.closest('.bg-slate-800');
            const amountInput = card.querySelector('input[type="number"]');
            
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              const amount = amountInput ? amountInput.value : '0';
              
              if (!amount || amount === '0') {
                showNotification('❌ Please enter amount to burn', 'error');
                return;
              }
              
              showNotification('🔄 Burning tokens...', 'info');
              
              const tx = await contract.burn(ethers.utils.parseEther(amount));
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              
              await tx.wait();
              showNotification('✅ Tokens burned successfully!', 'success');
              
              await updateBalance();
            } catch (error) {
              console.error('Burn error:', error);
              showNotification('❌ Burn failed: ' + error.message, 'error');
            }
          }

          async function executeStake(event) {
            const card = event.target.closest('.bg-slate-800');
            const amountInput = card.querySelector('input[type="number"]');
            
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              const amount = amountInput ? amountInput.value : '0';
              
              if (!amount || amount === '0') {
                showNotification('❌ Please enter amount to stake', 'error');
                return;
              }
              
              showNotification('🔄 Staking tokens...', 'info');
              
              const tx = await contract.stake(ethers.utils.parseEther(amount));
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              
              await tx.wait();
              showNotification('✅ Tokens staked successfully! Earning 1% daily!', 'success');
              
              await updateBalance();
            } catch (error) {
              console.error('Stake error:', error);
              showNotification('❌ Stake failed: ' + error.message, 'error');
            }
          }

          async function executePause() {
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              showNotification('🔄 Pausing contract...', 'info');
              
              const tx = await contract.pause();
              await tx.wait();
              
              showNotification('✅ Contract paused!', 'success');
            } catch (error) {
              console.error('Pause error:', error);
              showNotification('❌ Pause failed: ' + error.message, 'error');
            }
          }

          async function executeUnpause() {
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              showNotification('🔄 Unpausing contract...', 'info');
              
              const tx = await contract.unpause();
              await tx.wait();
              
              showNotification('✅ Contract unpaused!', 'success');
            } catch (error) {
              console.error('Unpause error:', error);
              showNotification('❌ Unpause failed: ' + error.message, 'error');
            }
          }

          async function executeWhitelist(event) {
            const card = event.target.closest('.bg-slate-800');
            const addressInput = card.querySelector('input[type="text"]');
            
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              const address = addressInput ? addressInput.value : '';
              
              if (!address) {
                showNotification('❌ Please enter an address', 'error');
                return;
              }
              
              showNotification('🔄 Adding to whitelist...', 'info');
              
              const tx = await contract.addToWhitelist(address);
              await tx.wait();
              
              showNotification('✅ Address added to whitelist!', 'success');
            } catch (error) {
              console.error('Whitelist error:', error);
              showNotification('❌ Whitelist failed: ' + error.message, 'error');
            }
          }

          async function executeBlacklist(event) {
            const card = event.target.closest('.bg-slate-800');
            const addressInput = card.querySelector('input[type="text"]');
            
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              const address = addressInput ? addressInput.value : '';
              
              if (!address) {
                showNotification('❌ Please enter an address', 'error');
                return;
              }
              
              showNotification('🔄 Adding to blacklist...', 'info');
              
              const tx = await contract.addToBlacklist(address);
              await tx.wait();
              
              showNotification('✅ Address blacklisted!', 'success');
            } catch (error) {
              console.error('Blacklist error:', error);
              showNotification('❌ Blacklist failed: ' + error.message, 'error');
            }
          }

          function executeAction(action) {
            // Fallback for features not yet implemented
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!\\n\\nGo to builder and click "Deploy Contract"', 'warning');
              return;
            }
            
            showNotification('ℹ️ ' + action + ' feature\\n\\nThis would execute the transaction on your deployed contract.', 'info');
          }

          function showNotification(message, type = 'info') {
            // Remove existing notifications
            const existing = document.getElementById('notification');
            if (existing) existing.remove();
            
            // Create notification
            const notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-md animate-slide-in';
            
            let bgColor = 'bg-blue-500';
            let icon = 'ℹ️';
            
            if (type === 'success') {
              bgColor = 'bg-green-500';
              icon = '✅';
            } else if (type === 'error') {
              bgColor = 'bg-red-500';
              icon = '❌';
            } else if (type === 'warning') {
              bgColor = 'bg-yellow-500';
              icon = '⚠️';
            }
            
            notification.className += ' ' + bgColor + ' text-white';
            notification.innerHTML = '<div class="flex items-start gap-3"><span class="text-2xl">' + icon + '</span><div class="flex-1 whitespace-pre-line">' + message + '</div></div>';
            
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
              if (notification.parentElement) {
                notification.remove();
              }
            }, 5000);
          }

          // Replace onclick handlers when page loads
          document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('button').forEach(btn => {
              const text = btn.textContent;
              
              if (text.includes('Mint')) {
                btn.onclick = executeMint;
              } else if (text.includes('Burn')) {
                btn.onclick = executeBurn;
              } else if (text.includes('Stake')) {
                btn.onclick = executeStake;
              } else if (text.includes('Pause') && !text.includes('Unpause')) {
                btn.onclick = executePause;
              } else if (text.includes('Unpause')) {
                btn.onclick = executeUnpause;
              } else if (text.includes('Whitelist')) {
                btn.onclick = executeWhitelist;
              } else if (text.includes('Blacklist')) {
                btn.onclick = executeBlacklist;
              }
            });
          });
        </script>
      </body>
      </html>
    `
  }

  const generateFeatureUI = (feature: string, isNFT: boolean) => {
    switch (feature) {
      case "Mint":
        return isNFT
          ? `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
             <button onclick="executeAction('Mint NFT')" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Mint NFT</button>`
          : `<input type="number" placeholder="Amount" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
             <button onclick="executeAction('Mint Tokens')" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Mint Tokens</button>`

      case "Burn":
        return `<input type="number" placeholder="Amount to Burn" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Burn Tokens')" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">Burn Tokens</button>`

      case "Stake":
        return `<input type="number" placeholder="Amount to Stake" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2">
                <div class="text-sm text-slate-400 mb-3">APY: 365% (1% daily)</div>
                <button onclick="executeAction('Stake Tokens')" class="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors">Stake Tokens</button>`

      case "Withdraw":
        return `<div class="text-sm text-slate-400 mb-3">Contract Balance: 0 CELO</div>
                <button onclick="executeAction('Withdraw ETH')" class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">Withdraw ETH</button>`

      case "Pause/Unpause":
        return `<div class="text-sm text-slate-400 mb-3">Status: <span class="text-green-400 font-medium">Active</span></div>
                <div class="flex gap-2">
                  <button onclick="executeAction('Pause Contract')" class="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors">Pause</button>
                  <button onclick="executeAction('Unpause Contract')" class="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">Unpause</button>
                </div>`

      case "Whitelist":
        return `<input type="text" placeholder="Address to Whitelist" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Add to Whitelist')" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Add to Whitelist</button>`

      case "Blacklist":
        return `<input type="text" placeholder="Address to Blacklist" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Add to Blacklist')" class="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">Blacklist Address</button>`

      case "Royalties":
        return `<div class="text-sm text-slate-400 mb-2">Royalty Rate: 2.5%</div>
                <input type="text" placeholder="Royalty Receiver Address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2">
                <input type="number" placeholder="Percentage (250 = 2.5%)" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Set Royalty')" class="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors">Update Royalty</button>`

      case "Airdrop":
        return `<textarea placeholder="Addresses (one per line)" rows="2" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-2"></textarea>
                <input type="number" placeholder="Amount per address" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Execute Airdrop')" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Airdrop Tokens</button>`

      case "Voting":
        return `<input type="text" placeholder="Proposal Description" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Create Proposal')" class="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">Create Proposal</button>`

      case "Snapshot":
        return `<div class="text-sm text-slate-400 mb-3">Current Snapshot ID: 0</div>
                <button onclick="executeAction('Take Snapshot')" class="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors">Take Snapshot</button>`

      case "Timelock":
        return `<div class="text-sm text-slate-400 mb-2">Lock Duration: 2 days</div>
                <input type="number" placeholder="New Duration (seconds)" class="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white mb-3">
                <button onclick="executeAction('Update Timelock')" class="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">Set Duration</button>`

      default:
        return `<button onclick="executeAction('${feature}')" class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Execute ${feature}</button>`
    }
  }

  const htmlContent = generatePreviewHTML()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {baseBlock?.config?.name || "Contract"} Preview
            </h2>
            <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
              Live Preview
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
              srcDoc={htmlContent}
              className="w-full h-full border-0"
              title="dApp Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="h-full overflow-auto">
              <pre className="p-6 text-sm text-foreground bg-slate-900 h-full overflow-auto">
                <code>{solidityCode}</code>
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
            {blocks.length > 0 && (
              <div className="px-4 py-2 bg-green-500/10 rounded text-sm font-medium text-green-500">
                ✨ {blocks.length} blocks • {blocks.filter(b => b.type !== 'erc20' && b.type !== 'nft').length} features
              </div>
            )}
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
