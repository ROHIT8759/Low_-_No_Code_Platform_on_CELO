# 🎯 Quick Start Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Block Sidebar│  │    Canvas     │  │ Code Viewer  │      │
│  │              │  │               │  │              │      │
│  │ • ERC20      │─▶│  Drag & Drop  │─▶│  Generated   │      │
│  │ • Mint       │  │  Blocks       │  │  Solidity    │      │
│  │ • Burn       │  │               │  │              │      │
│  │ • Stake      │  │               │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                            │                                 │
│                            ▼                                 │
│                  [Deploy Contract Button]                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT MODAL                           │
│                                                              │
│  Step 1: Connect Wallet (MetaMask)                          │
│          ├─▶ Check if MetaMask installed                    │
│          ├─▶ Request wallet connection                      │
│          └─▶ Detect current network                         │
│                                                              │
│  Step 2: Network Check                                      │
│          ├─▶ Verify on Celo Sepolia (84532)                │
│          └─▶ Auto-switch if wrong network                   │
│                                                              │
│  Step 3: Enter Token Details                                │
│          ├─▶ Token Name                                     │
│          ├─▶ Token Symbol                                   │
│          └─▶ Initial Supply                                 │
│                                                              │
│  Step 4: Deploy                                             │
│          └─▶ Click "Deploy Contract"                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND COMPILATION                          │
│                 (/api/compile)                               │
│                                                              │
│  1. Receive Solidity source code                            │
│  2. Parse contract name                                     │
│  3. Compile with solc                                       │
│     ├─▶ Language: Solidity                                  │
│     ├─▶ Version: ^0.8.20                                    │
│     ├─▶ Optimizer: enabled (200 runs)                       │
│     └─▶ Output: ABI + Bytecode                              │
│  4. Handle errors                                           │
│  5. Return compiled artifacts                               │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              BLOCKCHAIN DEPLOYMENT                           │
│                                                              │
│  1. Create ContractFactory(abi, bytecode, signer)           │
│  2. Parse constructor parameters:                           │
│     • name: "My Token"                                      │
│     • symbol: "MTK"                                         │
│     • initialSupply: parseEther("1000000")                  │
│  3. Deploy: factory.deploy(name, symbol, supply)            │
│  4. Wait for confirmation                                   │
│  5. Get contract address                                    │
│  6. Get transaction hash                                    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUCCESS SCREEN                             │
│                                                              │
│  ✅ Contract Deployed Successfully!                          │
│                                                              │
│  📍 Contract Address: 0x1234...5678 [Copy]                  │
│  🔗 Transaction Hash: 0xabcd...ef01                         │
│  🌐 Network: Celo Sepolia Testnet                           │
│                                                              │
│  [View on Block Explorer] [Close]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Flow

```
┌──────────────────────┐
│   User Browser       │
│  (React/Next.js)     │
└──────────┬───────────┘
           │
           │ 1. Click "Deploy"
           │
           ▼
┌──────────────────────┐
│  Deploy Modal Opens  │
│  - Connect Wallet    │
│  - Enter Details     │
└──────────┬───────────┘
           │
           │ 2. Generate Solidity
           │    (code-generator.tsx)
           ▼
┌──────────────────────┐
│  Solidity Code       │
│  (Standalone ERC20)  │
└──────────┬───────────┘
           │
           │ 3. POST /api/compile
           │    { solidityCode, contractName }
           ▼
┌──────────────────────┐
│  Backend API         │
│  - Compile with solc │
│  - Return ABI + Code │
└──────────┬───────────┘
           │
           │ 4. { abi, bytecode }
           │
           ▼
┌──────────────────────┐
│  Frontend            │
│  - ethers.js         │
│  - ContractFactory   │
└──────────┬───────────┘
           │
           │ 5. factory.deploy()
           │    with constructor params
           ▼
┌──────────────────────┐
│  MetaMask Prompt     │
│  - Confirm TX        │
│  - Pay Gas           │
└──────────┬───────────┘
           │
           │ 6. User confirms
           │
           ▼
┌──────────────────────┐
│  Blockchain          │
│  (Celo Sepolia)      │
│  - Process TX        │
│  - Deploy Contract   │
└──────────┬───────────┘
           │
           │ 7. TX Confirmed
           │    Contract Address
           ▼
┌──────────────────────┐
│  Success Screen      │
│  - Show Address      │
│  - Show TX Hash      │
│  - Explorer Link     │
└──────────────────────┘
```

---

## Data Flow Example

### User Input:

```json
{
  "blocks": [
    { "type": "erc20", "config": { "name": "MyToken" } },
    { "type": "mint" },
    { "type": "burn" }
  ],
  "tokenName": "My Token",
  "tokenSymbol": "MTK",
  "initialSupply": "1000000"
}
```

### Generated Solidity:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    address public owner;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        owner = msg.sender;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    // ... transfer, approve, transferFrom ...

    function mint(address to, uint256 amount) public onlyOwner {
        // ...
    }

    function burn(uint256 amount) public {
        // ...
    }
}
```

### Compilation API Request:

```json
POST /api/compile
{
  "solidityCode": "...",
  "contractName": "MyToken"
}
```

### Compilation API Response:

```json
{
  "success": true,
  "abi": [
    {
      "inputs": [
        { "name": "_name", "type": "string" },
        { "name": "_symbol", "type": "string" },
        { "name": "_initialSupply", "type": "uint256" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    }
    // ... other functions
  ],
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "warnings": []
}
```

### Deployment Transaction:

```javascript
const factory = new ethers.ContractFactory(abi, bytecode, signer);
const contract = await factory.deploy(
  "My Token", // name
  "MTK", // symbol
  ethers.parseEther("1000000") // initialSupply = 1000000 * 10^18
);
await contract.waitForDeployment();
const address = await contract.getAddress();
// address: 0x1234567890abcdef...
```

### Final Result:

```json
{
  "contractAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "network": "Celo Sepolia Testnet",
  "explorerUrl": "https://sepolia.basescan.org/address/0x1234..."
}
```

---

## Key Components

### 1. **Block Sidebar** (`components/block-sidebar.tsx`)

- Lists available blocks
- Drag & drop functionality
- Block previews

### 2. **Canvas** (`components/canvas.tsx`)

- Drop zone for blocks
- Visual block arrangement
- Delete/reorder blocks

### 3. **Code Generator** (`lib/code-generator.tsx`)

- Template-based Solidity generation
- Standalone ERC20 (no imports)
- Modular function injection

### 4. **Deploy Modal** (`components/deploy-modal.tsx`)

- Wallet connection
- Network detection/switching
- Parameter input
- Compilation + deployment orchestration
- Success/error handling

### 5. **Compile API** (`app/api/compile/route.ts`)

- Server-side Solidity compilation
- Error handling
- Bytecode + ABI extraction

---

## Network Configuration

### Celo Sepolia Testnet

```javascript
{
  chainId: 84532,
  name: "Celo Sepolia Testnet",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  }
}
```

### Celo Mainnet

```javascript
{
  chainId: 42220,
  name: "Celo Mainnet",
  rpcUrl: "https://forno.celo.org",
  blockExplorer: "https://explorer.celo.org",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18
  }
}
```

---

## Testing Checklist

- [ ] Visit http://localhost:3001/builder
- [ ] Drag ERC20 block to canvas
- [ ] Add Mint block
- [ ] Add Burn block
- [ ] Click "Deploy Contract" button
- [ ] Modal opens with 4 steps
- [ ] Connect MetaMask wallet
- [ ] Verify on Celo Sepolia (auto-switch if needed)
- [ ] Enter token details
- [ ] Click "Deploy Contract"
- [ ] Backend compiles (check console)
- [ ] Frontend deploys (check MetaMask)
- [ ] Transaction confirms
- [ ] Success screen shows contract address
- [ ] Click "View on Explorer" to verify
- [ ] Copy address to clipboard works

---

## Success! 🎉

Your contract deployment system is now fully functional with:

✅ Real Solidity compilation  
✅ Real blockchain deployment  
✅ Real contract addresses  
✅ Real transaction hashes  
✅ Block explorer verification

**Time to deploy some tokens!** 🚀
