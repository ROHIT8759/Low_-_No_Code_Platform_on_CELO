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

  
  const generatePreviewHTML = () => {
    const contractName = baseBlock?.config?.name || "MyToken"
    const symbol = baseBlock?.config?.symbol || "MTK"
    const isNFT = baseBlock?.type === "nft"

    
    const features = []
    if (hasFeature("transfer")) features.push("Transfer")
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

    
    if (baseBlock) {
      features.unshift("Balance")
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
        <title>${contractName} dApp Preview</title>
      </head>
      <body class="bg-gradient-to-br from-[#0A0D10] to-[#12171B] text-[#E8EEF4]">
        <script>
          let provider = null;
          let signer = null;
          let walletAddress = null;
          let contract = null;
          
          // Get deployed contract address from localStorage
          let CONTRACT_ADDRESS = localStorage.getItem('deployedContractAddress') || "0x0000000000000000000000000000000000000000";
          
          // Helper function to get ethereum provider (works in iframe)
          function getEthereum() {
            if (typeof window.ethereum !== 'undefined') return window.ethereum;
            try {
              if (window.parent && typeof window.parent.ethereum !== 'undefined') return window.parent.ethereum;
            } catch (e) {}
            try {
              if (window.top && typeof window.top.ethereum !== 'undefined') return window.top.ethereum;
            } catch (e) {}
            return null;
          }
          
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
            "function owner() view returns (address)",
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function transferFrom(address from, address to, uint256 tokenId) external"
          ];

          // Notification function
          function showNotification(message, type = 'info') {
            const colors = {
              success: 'bg-[#2EC892]',
              error: 'bg-[#EF4444]',
              warning: 'bg-[#F4B740]',
              info: 'bg-[#4C8DFF]'
            };
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 ' + colors[type] + ' text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in max-w-sm';
            notification.innerHTML = message.replace(/\\n/g, '<br>');
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
          }

          // Check for existing wallet connection on load
          async function checkExistingWallet() {
            try {
              const ethereum = getEthereum();
              if (ethereum) {
                const accounts = await ethereum.request({ method: 'eth_accounts' });
                if (accounts && accounts.length > 0) {
                  walletAddress = accounts[0];
                  await autoConnectWallet();
                }
              }
            } catch (error) {
              console.error('Error checking existing wallet:', error);
            }
          }

          // Update contract info on page load
          window.addEventListener('DOMContentLoaded', () => {
            const contractInfo = document.getElementById('contractInfo');
            const contractAddressCard = document.getElementById('contractAddressCard');
            const contractAddressDisplay = document.getElementById('contractAddressDisplay');
            const explorerLink = document.getElementById('explorerLink');
            
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              if (contractInfo) {
                contractInfo.textContent = '📄 Contract: ' + CONTRACT_ADDRESS.slice(0, 10) + '...' + CONTRACT_ADDRESS.slice(-8);
                contractInfo.classList.remove('text-[#9AA3AD]');
                contractInfo.classList.add('text-emerald-400');
              }
              
              // Show contract address card
              if (contractAddressCard) contractAddressCard.classList.remove('hidden');
              if (contractAddressDisplay) contractAddressDisplay.textContent = CONTRACT_ADDRESS;
              if (explorerLink) explorerLink.href = 'https://sepolia.celoscan.io/address/' + CONTRACT_ADDRESS;
            } else {
              if (contractInfo) {
                contractInfo.textContent = '⚠️ No contract deployed - Deploy first from builder';
                contractInfo.classList.add('text-amber-400');
              }
            }
            
            // Check for existing wallet connection
            checkExistingWallet();
          });

          function openExplorer() {
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              window.open('https://sepolia.celoscan.io/address/' + CONTRACT_ADDRESS, '_blank');
            } else {
              showNotification('⚠️ No contract deployed yet!', 'warning');
            }
          }

          function copyContractAddress() {
            if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
              navigator.clipboard.writeText(CONTRACT_ADDRESS);
              showNotification('📋 Contract address copied!', 'success');
            }
          }

          function verifyContract() {
            showNotification('✅ Contract verification coming soon!\\n\\nYou can verify manually on the block explorer', 'info');
          }

          async function updateBalance() {
            if (!contract || !walletAddress) return;
            try {
              const balance = await contract.balanceOf(walletAddress);
              const formatted = ethers.utils.formatEther(balance);
              // Update balance displays if they exist
              document.querySelectorAll('.balance-display').forEach(el => {
                el.textContent = parseFloat(formatted).toFixed(4);
              });
            } catch (error) {
              console.error('Error fetching balance:', error);
            }
          }

          async function autoConnectWallet() {
            try {
              if (typeof ethers === 'undefined') {
                setTimeout(autoConnectWallet, 300);
                return;
              }
              
              const ethereum = getEthereum();
              if (!ethereum) return;
              
              provider = new ethers.providers.Web3Provider(ethereum);
              signer = provider.getSigner();
              walletAddress = await signer.getAddress();
              
              // Update button
              const connectBtn = document.getElementById('connectBtn');
              if (connectBtn) {
                connectBtn.textContent = '✅ ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
                connectBtn.classList.remove('from-[#2EC892]', 'to-[#4C8DFF]', 'hover:from-[#4AD8A4]', 'hover:to-[#6AA2FF]');
                connectBtn.classList.add('from-[#2EC892]', 'to-[#3BD6A5]');
              }
              
              // Initialize contract if deployed
              if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
              }
              
              // Load balance if contract exists
              if (contract) {
                await updateBalance();
              }
            } catch (error) {
              console.error('Auto-connect error:', error);
            }
          }

          async function connectWallet() {
            console.log('🔌 Connect Wallet clicked');
            try {
              // Wait for ethers to load if needed
              if (typeof ethers === 'undefined') {
                console.log('⏳ Waiting for ethers.js to load...');
                showNotification('⏳ Loading Web3 libraries...', 'info');
                setTimeout(connectWallet, 500);
                return;
              }

              console.log('✓ ethers.js loaded');
              
              // Check if MetaMask or compatible wallet is installed
              const ethereum = getEthereum();
              if (!ethereum) {
                console.error('❌ No Web3 wallet detected');
                showNotification('❌ No Web3 wallet detected!\\n\\nPlease install MetaMask or another Web3 wallet.', 'error');
                window.open('https://metamask.io/download/', '_blank');
                return;
              }

              console.log('✓ ethereum available');
              showNotification('🔄 Connecting wallet...', 'info');

              // Request account access
              console.log('📱 Requesting wallet accounts...');
              const accounts = await ethereum.request({ 
                method: 'eth_requestAccounts' 
              });
              console.log('📱 Accounts returned:', accounts);
              
              if (!accounts || accounts.length === 0) {
                console.error('❌ No accounts found');
                showNotification('❌ No accounts found. Please unlock your wallet.', 'error');
                return;
              }

              walletAddress = accounts[0];
              console.log('✅ Wallet connected:', walletAddress);
              
              // Create provider and signer
              provider = new ethers.providers.Web3Provider(ethereum);
              signer = provider.getSigner();
              
              // Check network
              const network = await provider.getNetwork();
              const celoSepoliaChainId = 44787; // Celo Alfajores Testnet
              console.log('📡 Current network chainId:', network.chainId);
              
              if (network.chainId !== celoSepoliaChainId) {
                console.warn('⚠️ Wrong network, switching...');
                showNotification('⚠️ Wrong network! Switching to testnet...', 'warning');
                try {
                  await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + celoSepoliaChainId.toString(16) }],
                  });
                  console.log('✅ Network switched');
                } catch (switchError) {
                  console.log('Network not added, trying to add...');
                  // Network not added, try to add it
                  if (switchError.code === 4902) {
                    try {
                      await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                          chainId: '0x' + celoSepoliaChainId.toString(16),
                          chainName: 'Celo Alfajores Testnet',
                          nativeCurrency: {
                            name: 'CELO',
                            symbol: 'CELO',
                            decimals: 18
                          },
                          rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
                          blockExplorerUrls: ['https://alfajores.celoscan.io']
                        }],
                      });
                      console.log('✅ Network added');
                    } catch (addError) {
                      console.error('❌ Failed to add network:', addError);
                      showNotification('❌ Failed to add network: ' + addError.message, 'error');
                      return;
                    }
                  } else {
                    console.error('❌ Failed to switch network:', switchError);
                    showNotification('❌ Failed to switch network: ' + switchError.message, 'error');
                    return;
                  }
                }
              }
              
              // Initialize contract if deployed
              if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
                contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
                console.log('✅ Contract instance created');
                showNotification('✅ Wallet connected!\\n📄 Contract loaded\\n👛 ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4), 'success');
                await updateBalance();
              } else {
                console.log('⚠️ No contract deployed');
                showNotification('✅ Wallet connected!\\n👛 ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4) + '\\n⚠️ Deploy contract to interact', 'success');
              }
              
              // Update UI button
              const connectBtn = document.getElementById('connectBtn');
              if (connectBtn) {
                connectBtn.textContent = '✅ ' + walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
                connectBtn.classList.remove('from-[#2EC892]', 'to-[#4C8DFF]', 'hover:from-[#4AD8A4]', 'hover:to-[#6AA2FF]');
                connectBtn.classList.add('from-[#2EC892]', 'to-[#3BD6A5]', 'cursor-default');
              }
              
              // Listen for account changes
              if (ethereum && ethereum.on) {
                ethereum.on('accountsChanged', (accounts) => {
                  if (accounts.length === 0) {
                    console.log('⚠️ Wallet disconnected');
                    showNotification('⚠️ Wallet disconnected', 'warning');
                    location.reload();
                  } else {
                    walletAddress = accounts[0];
                    console.log('🔄 Account changed:', walletAddress);
                    showNotification('🔄 Account changed to ' + walletAddress.slice(0, 6) + '...', 'info');
                    location.reload();
                  }
                });
              }
              
              // Listen for chain changes
              window.ethereum.on('chainChanged', () => {
                console.log('🔄 Chain changed, reloading...');
                location.reload();
              });
              
            } catch (error) {
              console.error('❌ Connection error:', error);
              showNotification('❌ ' + error.message, 'error');
            }
          }
        </script>
        <div class="min-h-screen p-8">
          <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="bg-[#12171B] rounded-lg border border-white/10 p-8 mb-6">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h1 class="text-4xl font-bold text-white mb-2">${contractName}</h1>
                  <p class="text-[#B6C0CA]">${isNFT ? 'NFT Collection' : 'Token'} (${symbol})</p>
                  <p id="contractInfo" class="text-xs text-[#9AA3AD] mt-2">Loading contract...</p>
                </div>
                <div class="text-right">
                  <div class="text-sm text-[#9AA3AD]">Network</div>
                  <div class="text-[#4C8DFF] font-medium">Testnet</div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  onclick="connectWallet()"
                  id="connectBtn"
                  class="flex-1 px-6 py-3 bg-gradient-to-r from-[#2EC892] to-[#4C8DFF] hover:from-[#4AD8A4] hover:to-[#6AA2FF] text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/40"
                >
                  🦊 Connect Wallet
                </button>
                <button 
                  onclick="openExplorer()"
                  id="explorerBtn"
                  class="px-8 py-3 bg-gradient-to-r from-[#4C8DFF] to-[#F4B740] hover:from-[#6AA2FF] hover:to-[#F7C86A] text-white font-bold rounded-lg transition-all transform hover:scale-110 hover:rotate-1 shadow-2xl shadow-[#4C8DFF]/35 border-2 border-white/10 backdrop-blur-sm relative overflow-hidden group"
                >
                  <span class="absolute inset-0 bg-gradient-to-r from-[#6AA2FF] to-[#F7C86A] opacity-0 group-hover:opacity-20 transition-opacity"></span>
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
            <div id="contractAddressCard" class="bg-gradient-to-br from-[#1B222B]/70 to-[#0F1622]/80 rounded-xl border-2 border-white/10 p-6 mb-6 backdrop-blur-sm shadow-xl hidden">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="text-sm text-[#F7C86A] font-medium mb-2">📄 Smart Contract Address</div>
                  <div id="contractAddressDisplay" class="text-white font-mono text-lg bg-[#12171B]/50 px-4 py-3 rounded-lg border border-[#F4B740]/30 break-all"></div>
                </div>
                <button 
                  onclick="copyContractAddress()"
                  class="ml-4 px-6 py-3 bg-[#4C8DFF] hover:bg-[#3B78E8] text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#4C8DFF]/40"
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
                  class="flex-1 px-4 py-2 bg-[#4C8DFF] hover:bg-[#3B78E8] text-white text-center font-medium rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  � View on Block Explorer
                </a>
                <button 
                  onclick="verifyContract()"
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#4C8DFF] hover:from-[#4AD8A4] hover:to-[#6AA2FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-md"
                >
                  ✅ Verify Contract
                </button>
              </div>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              ${features.map((feature, index) => `
                <div class="bg-[#12171B] rounded-lg border border-white/10 p-6 hover:border-[#2EC892]/60 transition-all">
                  <h3 class="text-xl font-bold text-white mb-4">${feature}</h3>
                  ${generateFeatureUI(feature, isNFT)}
                </div>
              `).join('')}
            </div>

            <!-- Contract Stats -->
            <div class="bg-[#12171B] rounded-lg border border-white/10 p-8">
              <h3 class="text-2xl font-bold text-white mb-6">Contract Statistics</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div class="text-sm text-[#9AA3AD] mb-1">Total Supply</div>
                  <div class="text-2xl font-bold text-white">${isNFT ? '0 NFTs' : '1M'}</div>
                </div>
                <div>
                  <div class="text-sm text-[#9AA3AD] mb-1">Holders</div>
                  <div class="text-2xl font-bold text-white">0</div>
                </div>
                <div>
                  <div class="text-sm text-[#9AA3AD] mb-1">Transactions</div>
                  <div class="text-2xl font-bold text-white">0</div>
                </div>
                <div>
                  <div class="text-sm text-[#9AA3AD] mb-1">Your Balance</div>
                  <div class="text-2xl font-bold text-[#4C8DFF]">0</div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 text-center text-[#9AA3AD] text-sm">
              Built with Block Builder 🚀
            </div>
          </div>
        </div>

        <script>
          // Execute Functions (these use the variables defined in the first script)
          
          async function checkBalance(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const addressInput = card.querySelector('#balanceCheckAddress');
            const resultDiv = card.querySelector('#balanceResult');
            
            if (!contract) {
              showNotification('⚠️ Please connect your wallet and deploy the contract first!', 'warning');
              return;
            }
            
            try {
              const address = addressInput && addressInput.value ? addressInput.value : walletAddress;
              
              if (!address) {
                showNotification('❌ Please enter an address or connect your wallet', 'error');
                return;
              }
              
              showNotification('🔄 Checking balance...', 'info');
              
              const balance = await contract.balanceOf(address);
              const formattedBalance = ethers.utils.formatEther(balance);
              
              if (resultDiv) {
                resultDiv.textContent = formattedBalance + ' tokens';
                resultDiv.style.display = 'block';
              }
              
              showNotification('✅ Balance: ' + formattedBalance + ' tokens', 'success');
            } catch (error) {
              console.error('Check balance error:', error);
              showNotification('❌ Failed to check balance: ' + error.message, 'error');
              if (resultDiv) resultDiv.style.display = 'none';
            }
          }

          async function executeTransfer(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const inputs = card.querySelectorAll('input');
            const recipientInput = inputs[0];
            const amountInput = inputs[1];
            
            if (!walletAddress) {
              showNotification('⚠️ Please connect your wallet first!', 'warning');
              return;
            }
            
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
              showNotification('⚠️ Please deploy your contract first!', 'warning');
              return;
            }
            
            try {
              const recipient = recipientInput ? recipientInput.value : '';
              const amount = amountInput ? amountInput.value : '0';
              
              if (!recipient || !amount || amount === '0') {
                showNotification('❌ Please fill in all fields', 'error');
                return;
              }
              
              showNotification('🔄 Transferring tokens...', 'info');
              
              const isNFT = amountInput && amountInput.placeholder.includes('Token ID');
              let tx;
              if (isNFT) {
                tx = await contract.transferFrom(walletAddress, recipient, amount);
              } else {
                tx = await contract.transfer(recipient, ethers.utils.parseEther(amount));
              }
              
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              await tx.wait();
              showNotification('✅ Transfer successful!', 'success');
              
              if (recipientInput) recipientInput.value = '';
              if (amountInput) amountInput.value = '';
              await updateBalance();
            } catch (error) {
              console.error('Transfer error:', error);
              showNotification('❌ Transfer failed: ' + error.message, 'error');
            }
          }

          async function executeMint(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const addressInput = card.querySelector('input[placeholder*="Address"], input[placeholder*="Recipient"]');
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
              const to = addressInput ? addressInput.value : walletAddress;
              const amount = amountInput ? amountInput.value : '1';
              
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
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
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
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
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
              showNotification('✅ Tokens staked successfully!', 'success');
              await updateBalance();
            } catch (error) {
              console.error('Stake error:', error);
              showNotification('❌ Stake failed: ' + error.message, 'error');
            }
          }

          async function executePause() {
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
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
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
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
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const addressInput = card.querySelector('input[type="text"]');
            
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const address = addressInput ? addressInput.value : '';
              if (!address) { showNotification('❌ Please enter an address', 'error'); return; }
              
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
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const addressInput = card.querySelector('input[type="text"]');
            
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const address = addressInput ? addressInput.value : '';
              if (!address) { showNotification('❌ Please enter an address', 'error'); return; }
              
              showNotification('🔄 Adding to blacklist...', 'info');
              const tx = await contract.addToBlacklist(address);
              await tx.wait();
              showNotification('✅ Address blacklisted!', 'success');
            } catch (error) {
              console.error('Blacklist error:', error);
              showNotification('❌ Blacklist failed: ' + error.message, 'error');
            }
          }

          async function executeWithdraw(event) {
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              showNotification('🔄 Withdrawing funds...', 'info');
              const tx = await contract.withdraw();
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              await tx.wait();
              showNotification('✅ Funds withdrawn successfully!', 'success');
            } catch (error) {
              console.error('Withdraw error:', error);
              showNotification('❌ Withdraw failed: ' + error.message, 'error');
            }
          }

          async function executeRoyalty(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const addressInput = card.querySelectorAll('input[type="text"]')[0];
            const percentageInput = card.querySelector('input[type="number"]');
            
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const receiver = addressInput ? addressInput.value : '';
              const percentage = percentageInput ? percentageInput.value : '250';
              if (!receiver) { showNotification('❌ Please enter a receiver address', 'error'); return; }
              
              showNotification('🔄 Setting royalty info...', 'info');
              const tx = await contract.setRoyaltyInfo(receiver, percentage);
              await tx.wait();
              showNotification('✅ Royalty updated to ' + (parseInt(percentage) / 100) + '%!', 'success');
            } catch (error) {
              console.error('Royalty error:', error);
              showNotification('❌ Royalty update failed: ' + error.message, 'error');
            }
          }

          async function executeAirdrop(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const textarea = card.querySelector('textarea');
            const amountInput = card.querySelector('input[type="number"]');
            
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const addresses = textarea ? textarea.value.split('\\n').filter(a => a.trim()) : [];
              const amount = amountInput ? amountInput.value : '0';
              
              if (addresses.length === 0) { showNotification('❌ Please enter at least one address', 'error'); return; }
              if (!amount || amount === '0') { showNotification('❌ Please enter amount per address', 'error'); return; }
              
              const amounts = addresses.map(() => ethers.utils.parseEther(amount));
              showNotification('🔄 Executing airdrop to ' + addresses.length + ' addresses...', 'info');
              const tx = await contract.airdrop(addresses, amounts);
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              await tx.wait();
              showNotification('✅ Airdrop completed to ' + addresses.length + ' addresses!', 'success');
            } catch (error) {
              console.error('Airdrop error:', error);
              showNotification('❌ Airdrop failed: ' + error.message, 'error');
            }
          }

          async function executeCreateProposal(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const inputs = card.querySelectorAll('input');
            const descriptionInput = inputs[0];
            const periodInput = inputs[1];
            
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const description = descriptionInput ? descriptionInput.value : '';
              const period = periodInput ? periodInput.value : '86400';
              if (!description) { showNotification('❌ Please enter a proposal description', 'error'); return; }
              
              showNotification('🔄 Creating proposal...', 'info');
              const tx = await contract.createProposal(description, period);
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              await tx.wait();
              showNotification('✅ Proposal created successfully!', 'success');
            } catch (error) {
              console.error('Create proposal error:', error);
              showNotification('❌ Create proposal failed: ' + error.message, 'error');
            }
          }

          async function executeVote(support) {
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const proposalId = prompt('Enter Proposal ID to vote on:');
              if (!proposalId) return;
              
              showNotification('🔄 Submitting vote...', 'info');
              const tx = await contract.vote(proposalId, support);
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              await tx.wait();
              showNotification('✅ Vote submitted: ' + (support ? 'For' : 'Against') + '!', 'success');
            } catch (error) {
              console.error('Vote error:', error);
              showNotification('❌ Vote failed: ' + error.message, 'error');
            }
          }

          async function executeSnapshot(event) {
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              showNotification('🔄 Taking snapshot...', 'info');
              const tx = await contract.snapshot();
              showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
              await tx.wait();
              showNotification('✅ Snapshot taken successfully!', 'success');
            } catch (error) {
              console.error('Snapshot error:', error);
              showNotification('❌ Snapshot failed: ' + error.message, 'error');
            }
          }

          async function executeTimelock(event) {
            const card = event.target.closest('.bg-\\[\\#12171B\\]');
            const durationInput = card.querySelector('input[type="number"]');
            
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            
            try {
              const duration = durationInput ? durationInput.value : '172800';
              if (!duration || duration === '0') { showNotification('❌ Please enter a valid duration', 'error'); return; }
              
              showNotification('🔄 Setting timelock duration...', 'info');
              const tx = await contract.setTimelockDuration(duration);
              await tx.wait();
              const days = Math.floor(parseInt(duration) / 86400);
              const hours = Math.floor((parseInt(duration) % 86400) / 3600);
              showNotification('✅ Timelock set to ' + days + ' days ' + hours + ' hours!', 'success');
            } catch (error) {
              console.error('Timelock error:', error);
              showNotification('❌ Timelock update failed: ' + error.message, 'error');
            }
          }

          function executeAction(action) {
            if (!walletAddress) { showNotification('⚠️ Please connect your wallet first!', 'warning'); return; }
            if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") { showNotification('⚠️ Please deploy your contract first!', 'warning'); return; }
            showNotification('ℹ️ ' + action + ' feature\\n\\nThis would execute the transaction on your deployed contract.', 'info');
          }
        </script>
      </body>
      </html>
    `
  }

  const generateFeatureUI = (feature: string, isNFT: boolean) => {
    switch (feature) {
      case "Balance":
        return isNFT
          ? `<div class="mb-3">
               <label class="text-sm text-[#B6C0CA] mb-2 block">Check Balance</label>
               <input type="text" id="balanceCheckAddress" placeholder="Enter address (or leave empty for your wallet)" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             </div>
             <button onclick="checkBalance(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#4C8DFF] hover:from-[#4AD8A4] hover:to-[#6AA2FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">📊 Check NFT Balance</button>
             <div id="balanceResult" class="mt-3 text-center text-xl font-bold text-emerald-400"></div>`
          : `<div class="mb-3">
               <label class="text-sm text-[#B6C0CA] mb-2 block">Check Balance</label>
               <input type="text" id="balanceCheckAddress" placeholder="Enter address (or leave empty for your wallet)" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             </div>
             <button onclick="checkBalance(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#4C8DFF] hover:from-[#4AD8A4] hover:to-[#6AA2FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">📊 Check Balance</button>
             <div id="balanceResult" class="mt-3 text-center text-xl font-bold text-emerald-400"></div>`

      case "Transfer":
        return isNFT
           ? `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <input type="number" placeholder="Token ID" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <button onclick="executeTransfer(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#3BD6A5] hover:from-[#4AD8A4] hover:to-[#5CE1B4] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">➡️ Transfer NFT</button>`
           : `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <input type="number" placeholder="Amount" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <button onclick="executeTransfer(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#3BD6A5] hover:from-[#4AD8A4] hover:to-[#5CE1B4] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">💸 Send Tokens</button>`

      case "Mint":
        return isNFT
           ? `<input type="text" placeholder="Recipient Address" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <button onclick="executeMint(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#4C8DFF] to-[#2EC892] hover:from-[#6AA2FF] hover:to-[#4AD8A4] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#4C8DFF]/30">🎨 Mint NFT</button>`
           : `<input type="text" placeholder="Recipient Address (optional)" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <input type="number" placeholder="Amount" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
             <button onclick="executeMint(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#4C8DFF] to-[#2EC892] hover:from-[#6AA2FF] hover:to-[#4AD8A4] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#4C8DFF]/30">💰 Mint Tokens</button>`

      case "Burn":
        return `<input type="number" placeholder="Amount to Burn" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
          <button onclick="executeBurn(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#EF4444] to-[#F97316] hover:from-[#F87171] hover:to-[#FB923C] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#EF4444]/30">🔥 Burn Tokens</button>`

      case "Stake":
        return `<input type="number" placeholder="Amount to Stake" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#F4B740] focus:ring-1 focus:ring-[#F4B740] outline-none">
          <div class="text-sm text-[#B6C0CA] mb-3">📈 APY: 365% (1% daily)</div>
          <button onclick="executeStake(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#F4B740] to-[#F59E0B] hover:from-[#F7C86A] hover:to-[#F8B44A] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#F4B740]/30">⭐ Stake Tokens</button>`

      case "Withdraw":
        return `<div class="text-sm text-[#B6C0CA] mb-3">💰 Contract Balance: <span class="text-emerald-400 font-bold">0 ETH</span></div>
          <button onclick="executeWithdraw(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#3BD6A5] hover:from-[#4AD8A4] hover:to-[#5CE1B4] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">💸 Withdraw ETH</button>`

      case "Pause/Unpause":
        return `<div class="text-sm text-[#B6C0CA] mb-3">Status: <span class="text-emerald-400 font-medium" id="contractStatus">Active</span></div>
                <div class="flex gap-2">
                  <button onclick="executePause()" class="flex-1 px-4 py-2 bg-gradient-to-r from-[#F4B740] to-[#F59E0B] hover:from-[#F7C86A] hover:to-[#F8B44A] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#F4B740]/30">⏸️ Pause</button>
                  <button onclick="executeUnpause()" class="flex-1 px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#3BD6A5] hover:from-[#4AD8A4] hover:to-[#5CE1B4] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">▶️ Unpause</button>
                </div>`

      case "Whitelist":
        return `<input type="text" placeholder="Address to Whitelist" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] outline-none">
          <button onclick="executeWhitelist(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#4C8DFF] to-[#6AA2FF] hover:from-[#6AA2FF] hover:to-[#8AB6FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#4C8DFF]/30">✅ Add to Whitelist</button>`

      case "Blacklist":
        return `<input type="text" placeholder="Address to Blacklist" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none">
          <button onclick="executeBlacklist(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#EF4444] to-[#F43F5E] hover:from-[#F87171] hover:to-[#FB7185] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#EF4444]/30">🚫 Blacklist Address</button>`

      case "Royalties":
        return `<div class="text-sm text-[#B6C0CA] mb-2">👑 Current Royalty Rate: <span class="text-[#F4B740] font-bold">2.5%</span></div>
          <input type="text" placeholder="Royalty Receiver Address" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#F4B740] focus:ring-1 focus:ring-[#F4B740] outline-none">
          <input type="number" placeholder="Percentage (250 = 2.5%)" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#F4B740] focus:ring-1 focus:ring-[#F4B740] outline-none">
          <button onclick="executeRoyalty(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#F4B740] to-[#F59E0B] hover:from-[#F7C86A] hover:to-[#F8B44A] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#F4B740]/30">🎵 Update Royalty</button>`

      case "Airdrop":
        return `<textarea placeholder="Addresses (one per line)" rows="2" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none resize-none"></textarea>
          <input type="number" placeholder="Amount per address" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#2EC892] focus:ring-1 focus:ring-[#2EC892] outline-none">
          <button onclick="executeAirdrop(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#4C8DFF] hover:from-[#4AD8A4] hover:to-[#6AA2FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">✈️ Airdrop Tokens</button>`

      case "Voting":
        return `<input type="text" placeholder="Proposal Description" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-2 focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] outline-none">
                <input type="number" placeholder="Voting Period (seconds)" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#4C8DFF] focus:ring-1 focus:ring-[#4C8DFF] outline-none">
                <button onclick="executeCreateProposal(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#4C8DFF] to-[#7C9BFF] hover:from-[#6AA2FF] hover:to-[#8AB6FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#4C8DFF]/30 mb-2">🗳️ Create Proposal</button>
                <div class="flex gap-2">
                  <button onclick="executeVote(true)" class="flex-1 px-3 py-2 bg-[#2EC892] hover:bg-[#4AD8A4] text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105">👍 Vote For</button>
                  <button onclick="executeVote(false)" class="flex-1 px-3 py-2 bg-[#EF4444] hover:bg-[#F87171] text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105">👎 Vote Against</button>
                </div>`

      case "Snapshot":
        return `<div class="text-sm text-[#B6C0CA] mb-3">📸 Current Snapshot ID: <span class="text-[#4C8DFF] font-bold">0</span></div>
          <button onclick="executeSnapshot(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#2EC892] to-[#4C8DFF] hover:from-[#4AD8A4] hover:to-[#6AA2FF] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#2EC892]/30">📷 Take Snapshot</button>`

      case "Timelock":
        return `<div class="text-sm text-[#B6C0CA] mb-2">⏰ Lock Duration: <span class="text-[#F4B740] font-bold">2 days</span></div>
          <input type="number" placeholder="New Duration (seconds)" class="w-full px-4 py-2 bg-[#0A0D10] border border-white/20 rounded-lg text-white mb-3 focus:border-[#F4B740] focus:ring-1 focus:ring-[#F4B740] outline-none">
          <button onclick="executeTimelock(event)" class="w-full px-4 py-2 bg-gradient-to-r from-[#F4B740] to-[#F59E0B] hover:from-[#F7C86A] hover:to-[#F8B44A] text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#F4B740]/30">🔒 Set Duration</button>`

      default:
        return `<button onclick="executeAction('${feature}')" class="w-full px-4 py-2 bg-[#4C8DFF] hover:bg-[#3B78E8] text-white font-medium rounded-lg transition-colors">Execute ${feature}</button>`
    }
  }

  const htmlContent = generatePreviewHTML()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-0)] rounded-lg border border-white/[0.08] w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[var(--surface-1)]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {baseBlock?.config?.name || "Contract"} Preview
            </h2>
            <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">
              Live Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--surface-2)] rounded-lg p-1">
              <button
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "preview"
                  ? "bg-primary text-white"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "code"
                  ? "bg-primary text-white"
                  : "text-zinc-400 hover:text-white"
                  }`}
              >
                <Code size={16} />
                Code
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-zinc-400 hover:text-white"
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
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
            />
          ) : (
            <div className="h-full overflow-auto">
              <pre className="p-6 text-sm text-foreground bg-[var(--surface-0)] h-full overflow-auto">
                <code>{solidityCode}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/[0.08] bg-[var(--surface-1)] flex gap-2 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              🔄 Refresh
            </button>
            {blocks.length > 0 && (
              <div className="px-4 py-2 bg-emerald-500/10 rounded text-sm font-medium text-emerald-400">
                ✨ {blocks.length} blocks • {blocks.filter(b => b.type !== 'erc20' && b.type !== 'nft').length} features
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
