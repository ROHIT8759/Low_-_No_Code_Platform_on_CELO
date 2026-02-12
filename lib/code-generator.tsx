"use client"

import type { Block } from "./store"
import { getTemplate, ContractConfig } from "./solidity-templates"

export function generateSolidityCode(blocks: Block[]): string {
    if (blocks.length === 0) {
        return "// Add blocks to generate code"
    }

    const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")
    const standaloneTypes = ["staking", "payment", "governance"]
    const standaloneBlock = blocks.find((b) => standaloneTypes.includes(b.type))

    
    if (standaloneBlock) {
        const config: ContractConfig = {
            name: standaloneBlock.config?.name || "StandaloneContract",
            symbol: standaloneBlock.config?.symbol || "SC",
            stablecoin: standaloneBlock.config?.stablecoin || "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
            stakingToken: standaloneBlock.config?.stakingToken || "0x0000000000000000000000000000000000000000",
            rewardToken: standaloneBlock.config?.rewardToken || "0x0000000000000000000000000000000000000000",
            governanceToken: standaloneBlock.config?.governanceToken || "0x0000000000000000000000000000000000000000",
        }

        return getTemplate(standaloneBlock.type, config)
    }

    
    if (!baseBlock) {
        return "// Start by adding an ERC20 Token or NFT Contract block"
    }

    
    const featureBlocks = blocks.filter((b) =>
        ["mint", "transfer", "burn", "stake", "withdraw", "pausable", "whitelist", "blacklist",
            "royalty", "airdrop", "timelock", "multisig", "voting", "snapshot", "permit"].includes(b.type)
    )

    
    return buildCombinedContract(baseBlock, featureBlocks)
}

function buildCombinedContract(baseBlock: Block, featureBlocks: Block[]): string {
    const config = {
        name: baseBlock.config?.name || "MyToken",
        symbol: baseBlock.config?.symbol || "MTK",
        initialSupply: baseBlock.config?.initialSupply || "1000000",
        baseUri: baseBlock.config?.baseUri || "https://ipfs.io/ipfs/",
    }

    const isERC20 = baseBlock.type === "erc20"
    const isNFT = baseBlock.type === "nft"

    
    let contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ${config.name} {
`

    
    if (isERC20) {
        contractCode += `    string public name = "${config.name}";
    string public symbol = "${config.symbol}";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        owner = msg.sender;
        totalSupply = ${config.initialSupply} * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
`
    } else if (isNFT) {
        contractCode += `    string public name = "${config.name}";
    string public symbol = "${config.symbol}";
    string public baseURI = "${config.baseUri}";
    uint256 public tokenIdCounter;
    address public owner;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        return string(abi.encodePacked(baseURI, toString(tokenId)));
    }

    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf[tokenId];
        require(msg.sender == tokenOwner || isApprovedForAll[tokenOwner][msg.sender], "Not authorized");
        getApproved[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(ownerOf[tokenId] == from, "Not token owner");
        require(
            msg.sender == from || 
            getApproved[tokenId] == msg.sender || 
            isApprovedForAll[from][msg.sender],
            "Not authorized"
        );
        require(to != address(0), "Invalid recipient");

        balanceOf[from]--;
        balanceOf[to]++;
        ownerOf[tokenId] = to;
        delete getApproved[tokenId];

        emit Transfer(from, to, tokenId);
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
`
    }

    
    const hasFeature = (type: string) => featureBlocks.some((b) => b.type === type)

    if (hasFeature("mint")) {
        if (isERC20) {
            contractCode += `
    function mint(address to, uint256 amount) public onlyOwner {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }
`
        } else if (isNFT) {
            contractCode += `
    function mint(address to) public onlyOwner {
        uint256 tokenId = tokenIdCounter;
        tokenIdCounter++;
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        emit Transfer(address(0), to, tokenId);
    }
`
        }
    }

    if (hasFeature("burn") && isERC20) {
        contractCode += `
    function burn(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
`
    }

    if (hasFeature("stake") && isERC20) {
        contractCode += `
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;
    uint256 public rewardRate = 100; // 1% per day (100 basis points)

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    function stake(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        if (stakedBalance[msg.sender] > 0) {
            uint256 reward = calculateReward(msg.sender);
            if (reward > 0) {
                balanceOf[msg.sender] += reward;
                totalSupply += reward;
                emit Transfer(address(0), msg.sender, reward);
            }
        }
        
        balanceOf[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
            balanceOf[msg.sender] += reward;
            totalSupply += reward;
            emit Transfer(address(0), msg.sender, reward);
            emit RewardClaimed(msg.sender, reward);
        }
        
        stakedBalance[msg.sender] -= amount;
        balanceOf[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        
        emit Unstaked(msg.sender, amount);
    }

    function claimReward() public {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards available");
        
        balanceOf[msg.sender] += reward;
        totalSupply += reward;
        stakeTimestamp[msg.sender] = block.timestamp;
        
        emit Transfer(address(0), msg.sender, reward);
        emit RewardClaimed(msg.sender, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakeTimestamp[user];
        uint256 reward = (stakedBalance[user] * rewardRate * stakingDuration) / (365 days * 10000);
        
        return reward;
    }
`
    }

    if (hasFeature("withdraw")) {
        contractCode += `
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
`
    }

    
    if (hasFeature("pausable")) {
        contractCode += `
    bool public paused;

    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Contract is not paused");
        _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }
`
    }

    
    if (hasFeature("whitelist")) {
        contractCode += `
    mapping(address => bool) public whitelist;
    bool public whitelistEnabled = true;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    modifier onlyWhitelisted() {
        if (whitelistEnabled) {
            require(whitelist[msg.sender], "Not whitelisted");
        }
        _;
    }

    function addToWhitelist(address account) public onlyOwner {
        whitelist[account] = true;
        emit AddedToWhitelist(account);
    }

    function removeFromWhitelist(address account) public onlyOwner {
        whitelist[account] = false;
        emit RemovedFromWhitelist(account);
    }

    function addMultipleToWhitelist(address[] calldata accounts) public onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelist[accounts[i]] = true;
            emit AddedToWhitelist(accounts[i]);
        }
    }

    function setWhitelistEnabled(bool enabled) public onlyOwner {
        whitelistEnabled = enabled;
    }
`
    }

    
    if (hasFeature("blacklist")) {
        contractCode += `
    mapping(address => bool) public blacklist;

    event AddedToBlacklist(address indexed account);
    event RemovedFromBlacklist(address indexed account);

    modifier notBlacklisted(address account) {
        require(!blacklist[account], "Address is blacklisted");
        _;
    }

    function addToBlacklist(address account) public onlyOwner {
        blacklist[account] = true;
        emit AddedToBlacklist(account);
    }

    function removeFromBlacklist(address account) public onlyOwner {
        blacklist[account] = false;
        emit RemovedFromBlacklist(account);
    }
`
    }

    
    if (hasFeature("royalty") && isNFT) {
        contractCode += `
    address public royaltyReceiver;
    uint256 public royaltyPercentage = 250; // 2.5% in basis points (100 = 1%)

    event RoyaltyInfoUpdated(address receiver, uint256 percentage);

    function setRoyaltyInfo(address receiver, uint256 percentage) public onlyOwner {
        require(percentage <= 1000, "Royalty too high"); // Max 10%
        royaltyReceiver = receiver;
        royaltyPercentage = percentage;
        emit RoyaltyInfoUpdated(receiver, percentage);
    }

    function royaltyInfo(uint256, uint256 salePrice) public view returns (address, uint256) {
        uint256 royaltyAmount = (salePrice * royaltyPercentage) / 10000;
        return (royaltyReceiver, royaltyAmount);
    }
`
    }

    
    if (hasFeature("airdrop")) {
        contractCode += `
    event AirdropCompleted(uint256 totalRecipients, uint256 totalAmount);

    function airdrop(address[] calldata recipients, uint256[] calldata amounts) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            ${isERC20 ? `
            require(balanceOf[msg.sender] >= amounts[i], "Insufficient balance");
            balanceOf[msg.sender] -= amounts[i];
            balanceOf[recipients[i]] += amounts[i];
            emit Transfer(msg.sender, recipients[i], amounts[i]);
            ` : `
            uint256 tokenId = tokenIdCounter;
            tokenIdCounter++;
            ownerOf[tokenId] = recipients[i];
            balanceOf[recipients[i]]++;
            emit Transfer(address(0), recipients[i], tokenId);
            `}
            totalAmount += amounts[i];
        }
        
        emit AirdropCompleted(recipients.length, totalAmount);
    }
`
    }

    
    if (hasFeature("timelock")) {
        contractCode += `
    mapping(bytes32 => uint256) public timelocks;
    uint256 public timelockDuration = 2 days;

    event TimelockCreated(bytes32 indexed id, uint256 unlockTime);
    event TimelockExecuted(bytes32 indexed id);

    function setTimelockDuration(uint256 duration) public onlyOwner {
        timelockDuration = duration;
    }

    function createTimelock(bytes32 id) internal {
        timelocks[id] = block.timestamp + timelockDuration;
        emit TimelockCreated(id, timelocks[id]);
    }

    function executeTimelock(bytes32 id) internal {
        require(timelocks[id] != 0, "Timelock does not exist");
        require(block.timestamp >= timelocks[id], "Timelock not expired");
        delete timelocks[id];
        emit TimelockExecuted(id);
    }
`
    }

    
    if (hasFeature("snapshot") && isERC20) {
        contractCode += `
    uint256 public currentSnapshotId;
    mapping(uint256 => mapping(address => uint256)) public snapshots;

    event SnapshotCreated(uint256 indexed id);

    function snapshot() public onlyOwner returns (uint256) {
        currentSnapshotId++;
        emit SnapshotCreated(currentSnapshotId);
        return currentSnapshotId;
    }

    function balanceOfAt(address account, uint256 snapshotId) public view returns (uint256) {
        require(snapshotId <= currentSnapshotId, "Invalid snapshot ID");
        return snapshots[snapshotId][account];
    }
`
    }

    
    if (hasFeature("voting") && isERC20) {
        contractCode += `
    struct Proposal {
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);

    function createProposal(string memory description, uint256 votingPeriod) public onlyOwner returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.description = description;
        proposal.deadline = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalId, description, proposal.deadline);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = balanceOf[msg.sender];
        require(weight > 0, "No voting power");
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        proposal.hasVoted[msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }
`
    }

    
    if (hasFeature("permit") && isERC20) {
        contractCode += `
    mapping(address => uint256) public nonces;

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(block.timestamp <= deadline, "Permit expired");
        
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"),
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
            )
        );
        
        address signer = ecrecover(structHash, v, r, s);
        require(signer == owner, "Invalid signature");
        
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
`
    }

    
    contractCode += `
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
`

    
    contractCode += `}`

    return contractCode
}

export function generateTypeScriptCode(blocks: Block[]): string {
    const baseBlock = blocks.find((b) => b.type === "erc20" || b.type === "nft")

    if (!baseBlock) {
        return "// Add blocks to generate frontend code"
    }

    const config = {
        name: baseBlock.config?.name || "MyToken",
        symbol: baseBlock.config?.symbol || "MTK",
    }

    const isERC20 = baseBlock.type === "erc20"
    const isNFT = baseBlock.type === "nft"

    
    const hasFeature = (type: string) => blocks.some((b) => b.type === type)

    let code = `"use client"

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Contract ABI (simplified - use full ABI from deployment)
const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  ${isERC20 ? '"function balanceOf(address) view returns (uint256)",' : ''}
  ${isERC20 ? '"function transfer(address, uint256) returns (bool)",' : ''}
  ${isNFT ? '"function ownerOf(uint256) view returns (address)",' : ''}
  ${isNFT ? '"function tokenURI(uint256) view returns (string)",' : ''}
  ${hasFeature('mint') ? (isERC20 ? '"function mint(address, uint256)",' : '"function mint(address, string) returns (uint256)",') : ''}
  ${hasFeature('burn') ? (isERC20 ? '"function burn(uint256)"' : '"function burn(uint256)"') : ''}
]

export default function ${config.name}App() {
  const [account, setAccount] = useState<string>('')
  const [contract, setContract] = useState<any>(null)
  ${isERC20 ? 'const [balance, setBalance] = useState<string>(\'0\')' : ''}
  ${isNFT ? 'const [tokenId, setTokenId] = useState<string>(\'0\')' : ''}
  ${hasFeature('transfer') ? 'const [recipient, setRecipient] = useState<string>(\'\')' : ''}
  ${hasFeature('transfer') && isERC20 ? 'const [amount, setAmount] = useState<string>(\'\')' : ''}

  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = '0x...'

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)

        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        )
        setContract(contractInstance)
      } catch (error) {
        console.error('Failed to connect:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }
${isERC20 ? `
  const loadBalance = async () => {
    if (contract && account) {
      try {
        const bal = await contract.balanceOf(account)
        setBalance(ethers.formatEther(bal))
      } catch (error) {
        console.error('Failed to load balance:', error)
      }
    }
  }

  useEffect(() => {
    if (contract && account) {
      loadBalance()
    }
  }, [contract, account])` : ''}
${isERC20 && hasFeature('transfer') ? `
  const handleTransfer = async () => {
    if (!contract || !recipient || !amount) return
    try {
      const tx = await contract.transfer(recipient, ethers.parseEther(amount))
      await tx.wait()
      alert('Transfer successful!')
      loadBalance()
      setRecipient('')
      setAmount('')
    } catch (error: any) {
      alert('Transfer failed: ' + error.message)
    }
  }` : ''}
${isNFT ? `
  const loadTokenURI = async () => {
    if (contract && tokenId) {
      try {
        const uri = await contract.tokenURI(tokenId)
        console.log('Token URI:', uri)
      } catch (error) {
        console.error('Failed to load token URI:', error)
      }
    }
  }` : ''}
${hasFeature('mint') && isNFT ? `
  const handleMint = async () => {
    if (!contract || !recipient) return
    try {
      const tx = await contract.mint(recipient, 'ipfs://...')
      await tx.wait()
      alert('Mint successful!')
    } catch (error: any) {
      alert('Mint failed: ' + error.message)
    }
  }` : ''}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          ${config.name} ${isERC20 ? 'Token' : 'NFT'} dApp
        </h1>

        {!account ? (
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <p className="text-slate-400">Connected Account:</p>
              <p className="text-white font-mono">{account}</p>
              ${isERC20 ? `<p className="text-slate-400 mt-4">Balance:</p>
              <p className="text-white text-2xl font-bold">{balance} ${config.symbol}</p>` : ''}
            </div>
${isERC20 && hasFeature('transfer') ? `
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Transfer ${config.symbol}</h2>
              <input
                type="text"
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
              />
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
              />
              <button
                onClick={handleTransfer}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
              >
                Send ${config.symbol}
              </button>
            </div>` : ''}
${isNFT ? `
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">View NFT</h2>
              <input
                type="number"
                placeholder="Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
              />
              <button
                onClick={loadTokenURI}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                Load Token URI
              </button>
            </div>` : ''}
${hasFeature('mint') && isNFT ? `
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Mint NFT</h2>
              <input
                type="text"
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white mb-3"
              />
              <button
                onClick={handleMint}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
              >
                Mint NFT
              </button>
            </div>` : ''}
          </div>
        )}
      </div>
    </div>
  )
}
`

    return code
}
