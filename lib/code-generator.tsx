"use client"

import type { Block } from "./store"

const SOLIDITY_TEMPLATES = {
  erc20: (config?: Record<string, any>) => `pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${config?.name || "GeneratedToken"}
 * @dev Implementation of the ERC20 standard token with modular functions
 */
contract ${config?.name?.replace(/\s+/g, "") || "GeneratedToken"} is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply * 10 ** uint256(decimals_));
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}`,

  nft: (config?: Record<string, any>) => `pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${config?.name || "GeneratedNFT"}
 * @dev Implementation of ERC721 NFT contract with modular functions
 */
contract ${config?.name?.replace(/\s+/g, "") || "GeneratedNFT"} is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}`,

  mint: () => `/**
     * @dev Mint new tokens to a specified address
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }`,

  transfer: () => `/**
     * @dev Enhanced transfer function with additional checks
     * @param to The address to transfer tokens to
     * @param amount The amount of tokens to transfer
     */
    function transferTokens(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, to, amount);
        return true;
    }`,

  burn: () => `/**
     * @dev Burn tokens from the caller's account
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit Burn(msg.sender, amount);
    }`,

  stake: () => `// Staking state variables
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakeTime;
    uint256 public totalStaked;

    /**
     * @dev Stake tokens to earn rewards
     * @param amount The amount of tokens to stake
     */
    function stake(uint256 amount) public {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(amount > 0, "Cannot stake 0 tokens");
        
        _transfer(msg.sender, address(this), amount);
        stakedAmount[msg.sender] += amount;
        stakeTime[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }`,

  withdraw: () => `/**
     * @dev Withdraw staked tokens
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(uint256 amount) public {
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked amount");
        require(amount > 0, "Cannot withdraw 0 tokens");
        
        stakedAmount[msg.sender] -= amount;
        totalStaked -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get staking information for an address
     * @param account The address to query
     */
    function getStakeInfo(address account) public view returns (uint256 amount, uint256 since) {
        return (stakedAmount[account], stakeTime[account]);
    }`,
}

const FRONTEND_TEMPLATE = (blocks: Block[]) => {
  const hasERC20 = blocks.some((b) => b.type === "erc20")
  const hasNFT = blocks.some((b) => b.type === "nft")
  const hasMint = blocks.some((b) => b.type === "mint")
  const hasStake = blocks.some((b) => b.type === "stake")

  return `'use client'

import { useState } from 'react'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ethers } from 'ethers'

export default function DApp() {
  const { address, connect, kit } = useContractKit()
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  ${hasERC20 ? `const [tokenAmount, setTokenAmount] = useState('')` : ""}
  ${hasNFT ? `const [nftUri, setNftUri] = useState('')` : ""}
  ${hasStake ? `const [stakeAmount, setStakeAmount] = useState('')` : ""}

  const handleConnect = async () => {
    try {
      await connect()
    } catch (err) {
      setError('Failed to connect wallet')
    }
  }

  ${hasMint
      ? `const handleMint = async () => {
    if (!address || !tokenAmount) return
    setLoading(true)
    setError(null)
    try {
      // Add your mint logic here
      console.log('Minting', tokenAmount, 'tokens')
      // Example: await contract.mint(address, ethers.parseEther(tokenAmount))
    } catch (err) {
      setError('Mint failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }`
      : ""
    }

  ${hasStake
      ? `const handleStake = async () => {
    if (!address || !stakeAmount) return
    setLoading(true)
    setError(null)
    try {
      // Add your stake logic here
      console.log('Staking', stakeAmount, 'tokens')
      // Example: await contract.stake(ethers.parseEther(stakeAmount))
    } catch (err) {
      setError('Stake failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }`
      : ""
    }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Generated dApp</h1>
          <p className="text-slate-400 mb-6">Built with Celo No-Code Builder</p>

          {!address ? (
            <button
              onClick={handleConnect}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Connect Celo Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-400">Connected Address</p>
                <p className="text-white font-mono text-sm">{address}</p>
              </div>

              ${hasMint
      ? `<div className="space-y-2">
                <label className="block text-sm font-medium text-white">Amount to Mint</label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleMint}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : 'Mint Tokens'}
                </button>
              </div>`
      : ""
    }

              ${hasStake
      ? `<div className="space-y-2">
                <label className="block text-sm font-medium text-white">Amount to Stake</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleStake}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : 'Stake Tokens'}
                </button>
              </div>`
      : ""
    }
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {txHash && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <p className="text-green-200 text-sm">Transaction: {txHash}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}`
}

export function generateSolidityCode(blocks: Block[]): string {
  if (blocks.length === 0) return "// No blocks selected. Add blocks from the sidebar to generate code."

  // Find the base contract (ERC20 or NFT)
  const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")

  if (!baseBlock) {
    return `// Start with an ERC20 Token or NFT Contract block
// Then add functions like Mint, Transfer, Burn, Stake, or Withdraw`
  }

  // Get the base contract template
  const template = SOLIDITY_TEMPLATES[baseBlock.type as keyof typeof SOLIDITY_TEMPLATES]
  let baseContract = ""

  if (typeof template === "function") {
    baseContract = template(baseBlock.config)
  } else {
    baseContract = template || "// Template not found"
  }

  // Get additional function blocks (excluding the base contract)
  const functionBlocks = blocks.filter((b) => b.type !== "erc20" && b.type !== "nft")

  // If no additional functions, return base contract
  if (functionBlocks.length === 0) {
    return baseContract
  }

  // Combine base contract with additional functions
  // Remove the closing brace of the base contract
  const contractWithoutClosing = baseContract.trimEnd().slice(0, -1)

  // Add additional functions
  const additionalFunctions = functionBlocks
    .map((block) => {
      const funcTemplate = SOLIDITY_TEMPLATES[block.type as keyof typeof SOLIDITY_TEMPLATES]
      if (typeof funcTemplate === "function") {
        return "    " + funcTemplate().replace(/\n/g, "\n    ")
      }
      return ""
    })
    .filter(Boolean)
    .join("\n\n")

  // Add events if staking functions are present
  const hasStake = functionBlocks.some((b) => b.type === "stake")
  const hasWithdraw = functionBlocks.some((b) => b.type === "withdraw")
  const hasBurn = functionBlocks.some((b) => b.type === "burn")

  let events = ""
  if (hasStake) events += "\n    event Staked(address indexed user, uint256 amount);"
  if (hasWithdraw) events += "\n    event Withdrawn(address indexed user, uint256 amount);"
  if (hasBurn) events += "\n    event Burn(address indexed burner, uint256 amount);"

  return `${contractWithoutClosing}${events ? "\n" + events + "\n" : "\n"}
${additionalFunctions}
}`
}

export function generateFrontendCode(blocks: Block[]): string {
  return FRONTEND_TEMPLATE(blocks)
}

export function generateContractABI(blocks: Block[]): string {
  const functions: string[] = []

  blocks.forEach((block) => {
    switch (block.type) {
      case "mint":
        functions.push(
          JSON.stringify({
            name: "mint",
            type: "function",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          }),
        )
        break
      case "transfer":
        functions.push(
          JSON.stringify({
            name: "transfer",
            type: "function",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ name: "", type: "bool" }],
            stateMutability: "nonpayable",
          }),
        )
        break
      case "burn":
        functions.push(
          JSON.stringify({
            name: "burn",
            type: "function",
            inputs: [{ name: "amount", type: "uint256" }],
            outputs: [],
            stateMutability: "nonpayable",
          }),
        )
        break
      case "stake":
        functions.push(
          JSON.stringify({
            name: "stake",
            type: "function",
            inputs: [{ name: "amount", type: "uint256" }],
            outputs: [],
            stateMutability: "nonpayable",
          }),
        )
        break
      case "withdraw":
        functions.push(
          JSON.stringify({
            name: "withdraw",
            type: "function",
            inputs: [{ name: "amount", type: "uint256" }],
            outputs: [],
            stateMutability: "nonpayable",
          }),
        )
        break
    }
  })

  return `[\n  ${functions.join(",\n  ")}\n]`
}
