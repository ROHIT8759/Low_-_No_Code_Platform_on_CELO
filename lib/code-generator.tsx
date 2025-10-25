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

  // If there's a standalone contract, return it (these can't be combined)
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

  // If no base contract, prompt user
  if (!baseBlock) {
    return "// Start by adding an ERC20 Token or NFT Contract block"
  }

  // Get all feature blocks (mint, transfer, burn, stake, withdraw)
  const featureBlocks = blocks.filter((b) =>
    ["mint", "transfer", "burn", "stake", "withdraw"].includes(b.type)
  )

  // Build the combined contract
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

  // Start with base template
  let contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ${config.name} {
`

  // Add state variables based on contract type
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

  // Add feature functions based on selected blocks
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

  // Add transferOwnership function
  contractCode += `
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
`

  // Close the contract
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

  if (baseBlock.type === "erc20") {
    return "// ERC20 Frontend coming soon"
  } else if (baseBlock.type === "nft") {
    return "// NFT Frontend coming soon"
  }

  return "// Frontend code generation coming soon"
}
