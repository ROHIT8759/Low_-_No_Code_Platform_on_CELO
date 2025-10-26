<div align="center">
  
  <!-- Use banner for full-width display or logo for centered display -->
  <img src="./public/assets/banner.svg" alt="CELO Builder Banner" width="100%"/>
  
  <!-- Alternative: Use logo instead
  <img src="./public/assets/logo.svg" alt="CELO Builder Logo" width="500"/>
  -->
  
  # 🚀 Low/No-Code Platform on CELO
  
  ### *Generate production-ready Next.js frontends from smart contract ABIs in seconds*
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Celo](https://img.shields.io/badge/Celo-Network-FCFF52?style=for-the-badge&logo=celo)](https://celo.org/)
  [![ethers.js](https://img.shields.io/badge/ethers.js-6-2535a0?style=for-the-badge)](https://docs.ethers.org/)
  
  ![GitHub Stars](https://img.shields.io/github/stars/ROHIT8759/Low_-_No_Code_Platform_on_CELO?style=social)
  ![GitHub Forks](https://img.shields.io/github/forks/ROHIT8759/Low_-_No_Code_Platform_on_CELO?style=social)
  ![GitHub Issues](https://img.shields.io/github/issues/ROHIT8759/Low_-_No_Code_Platform_on_CELO)
  ![License](https://img.shields.io/github/license/ROHIT8759/Low_-_No_Code_Platform_on_CELO)
  
  [Features](#-features) •
  [Quick Start](#-quick-start) •
  [Documentation](#-documentation) •
  [Examples](#-examples)
  
</div>

---

## 🎥 Demo Video

[![Watch Demo Video](https://img.shields.io/badge/▶️_Watch_Demo-Video-FF0000?style=for-the-badge&logo=youtube)](https://drive.google.com/file/d/1Cx-0OQRz05yvSZ_J5u9yBPpVGTOo5MTH/view?usp=sharing)

**[Click here to watch the full demo video →](https://drive.google.com/file/d/1Cx-0OQRz05yvSZ_J5u9yBPpVGTOo5MTH/view?usp=sharing)**

See CELO Builder in action! This video demonstrates:
- ✨ Building smart contracts with the visual builder
- 🚀 Deploying contracts to Celo network
- 🎨 Generating frontend applications automatically
- 💰 Requesting testnet tokens from the faucet
- 🔗 Connecting wallets and interacting with contracts

---

## 📖 About

**CELO Builder** is an intelligent no-code/low-code platform that automatically generates fully-functional Next.js dApps from your smart contract ABIs. Deploy a contract, paste the ABI, and get a production-ready frontend with wallet integration, transaction handling, and beautiful UI.

### 🎯 What's Included

| Component                 | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| 🎨 **Builder UI**         | Interactive Next.js app for generating frontends      |
| 🔧 **Code Generator**     | Smart generator in `lib/frontend-generator.ts`        |
| 🔗 **Wallet Integration** | MetaMask + Alchemy dual-provider support              |
| 📊 **Block Explorer**     | Celoscan API integration for tx verification          |
| 🎭 **ABI-Aware UI**       | Automatically detects and renders available functions |

### 📊 Why Use CELO Builder?

| Traditional Approach        | With CELO Builder          |
| --------------------------- | -------------------------- |
| ⏰ Days of coding           | ⚡ Minutes to generate     |
| 🔧 Manual ABI parsing       | 🤖 Automatic detection     |
| 🎨 Build UI from scratch    | ✨ Beautiful UI included   |
| 🔌 Setup wallet connection  | 🔗 Pre-integrated MetaMask |
| 📝 Write ethers.js code     | 📦 Production-ready code   |
| 🐛 Debug integration issues | ✅ Tested & reliable       |

### 🏆 Key Statistics

<div align="center">
  
| Metric | Value |
|--------|-------|
| ⚡ **Generation Time** | < 5 seconds |
| 📦 **Files Generated** | 10+ ready-to-use files |
| 🎨 **UI Components** | Wallet, Contract, Forms |
| 🔍 **Supported Functions** | mint, burn, transfer, approve, balanceOf |
| 🌐 **Networks** | Celo Mainnet & Alfajores |
  
</div>

---

## ✨ Features

<details open>
<summary><b>🎨 ABI-Aware Generation</b></summary>

- Automatically detects function signatures (`mint(address)` vs `mint(address, uint256)`)
- Generates UI components only for functions present in your contract
- Supports: `mint`, `burn`, `transfer`, `approve`, `balanceOf`, and more
- Smart parameter detection and validation

</details>

<details open>
<summary><b>🔌 Dual Provider Architecture</b></summary>

- **Primary**: MetaMask Browser Provider for user transactions
- **Fallback**: Alchemy RPC provider for enhanced reliability
- Automatic network switching and validation
- Seamless provider failover

</details>

<details open>
<summary><b>🔍 Transaction Verification</b></summary>

- Real-time transaction tracking with hash display
- Celoscan API integration for status verification
- Direct links to block explorer
- Success/failure notifications

</details>

<details open>
<summary><b>🎨 Beautiful UI Out-of-the-Box</b></summary>

- Pre-configured Tailwind CSS with dark theme
- Responsive design for mobile and desktop
- Custom components with backdrop blur and shadows
- Smooth transitions and hover effects

</details>

---

## 🚀 Quick Start

### Prerequisites

- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ MetaMask or Web3 wallet

### Installation

```powershell
# Clone the repository
git clone https://github.com/ROHIT8759/Low_-_No_Code_Platform_on_CELO.git
cd Low_-_No_Code_Platform_on_CELO

# Install dependencies
npm install

# Start the builder
npm run dev
```

🎉 **Open** http://localhost:3000 in your browser!

---

## 🎯 How to Use

### Step 1: Access the Builder

Navigate to http://localhost:3000/builder

### Step 2: Generate Your Frontend

<table>
<tr>
<td width="50%">

**Option A: Via UI**

1. Paste your contract ABI
2. Enter contract address
3. Select network (Celo/Alfajores)
4. Click **Generate Frontend**
5. Download ZIP file

</td>
<td width="50%">

**Option B: Programmatically**

```typescript
import { generateNextJsFrontend } from './lib/frontend-generator'

const files = generateNextJsFrontend({
  contractName: 'MyToken',
  contractAddress: '0x...',
  abi: [...],
  chainId: 44787,
  networkName: 'alfajores'
})
```

</td>
</tr>
</table>

### Step 3: Run Generated dApp

```powershell
# Extract the ZIP and navigate to the folder
cd mytoken-frontend

# Install dependencies
npm install

# Configure environment variables (see below)
# Edit .env.local

# Start the dApp
npm run dev
```

---

## 🔐 Environment Configuration

Create a `.env.local` file in your generated project:

```env
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_NETWORK_NAME=alfajores

# API Keys (Optional but Recommended)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_BLOCK_EXPLORER_API_KEY=your_celoscan_api_key
NEXT_PUBLIC_BLOCK_EXPLORER_URL=https://celoscan.io
```

<details>
<summary>📚 <b>How to get API keys</b></summary>

### Alchemy API Key

1. Visit [https://www.alchemy.com/](https://www.alchemy.com/)
2. Sign up for free
3. Create a new app → Select **Celo** network
4. Copy API key from dashboard

### Celoscan API Key

1. Visit [https://celoscan.io/](https://celoscan.io/)
2. Sign up for free
3. Navigate to **API Keys** section
4. Generate new API key

</details>

---

## 📚 Documentation

### 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Builder UI                          │
│              (Next.js App Router)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│            Frontend Generator                           │
│         (lib/frontend-generator.ts)                     │
│                                                         │
│  • Analyzes ABI signatures                             │
│  • Generates complete Next.js project                  │
│  • Creates: app/, components/, lib/                    │
│  • Configures: Tailwind, TypeScript, ethers.js        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Generated dApp                             │
│                                                         │
│  • WalletConnect Component                             │
│  • ContractInteraction Component                       │
│  • Alchemy + MetaMask Providers                        │
│  • Celoscan Integration                                │
└─────────────────────────────────────────────────────────┘
```

### 🔧 Tech Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| **Framework**      | Next.js 15 with App Router |
| **Language**       | TypeScript 5+              |
| **Styling**        | Tailwind CSS 3             |
| **Blockchain**     | ethers.js 6                |
| **RPC Provider**   | Alchemy API                |
| **Block Explorer** | Celoscan API               |

### 📂 Project Structure

```
d:\Celo Hackathon\aaaa\
├── app/
│   ├── page.tsx              # Landing page
│   ├── builder/
│   │   └── page.tsx          # Builder interface
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── block-sidebar.tsx     # UI component library
│   ├── canvas.tsx
│   ├── code-viewer.tsx
│   ├── deploy-modal.tsx
│   ├── navbar.tsx
│   ├── preview-modal.tsx
│   └── project-manager.tsx
├── lib/
│   ├── frontend-generator.ts # ⭐ Core generator logic
│   ├── code-generator.tsx
│   ├── store.ts              # State management
│   └── utils.ts
├── public/
│   └── assets/
│       └── logo.svg          # Project logo
└── README.md                 # This file
```

---

## 📸 Demo

<div align="center">
  
  ### 🎬 Watch it in Action
  
  <!-- Add your demo GIF here -->
  <!-- <img src="./public/assets/demo.gif" alt="Demo" width="800"/> -->
  
  <table>
    <tr>
      <td width="50%">
        <h4>📝 Builder Interface</h4>
        <p><i>Paste your ABI and generate instantly</i></p>
        <!-- <img src="./public/assets/builder-demo.png" alt="Builder" width="100%"/> -->
      </td>
      <td width="50%">
        <h4>🎨 Generated Frontend</h4>
        <p><i>Beautiful UI out of the box</i></p>
        <!-- <img src="./public/assets/generated-frontend.png" alt="Frontend" width="100%"/> -->
      </td>
    </tr>
  </table>
  
  > 💡 **Tip**: Add screenshots to `public/assets/` and uncomment the image tags above!
  
</div>

---

## 🎓 Examples

### Example 1: ERC-20 Token

<details>
<summary>Click to expand</summary>

**Contract Functions:**

- `mint(address, uint256)` ✅
- `burn(uint256)` ✅
- `transfer(address, uint256)` ✅
- `balanceOf(address)` ✅

**Generated UI:**

- Amount input for minting
- Burn tokens interface
- Transfer to address form
- Real-time balance display

</details>

### Example 2: NFT Contract

<details>
<summary>Click to expand</summary>

**Contract Functions:**

- `mint(address)` ✅ (no amount parameter)
- `tokenURI(uint256)` ✅
- `balanceOf(address)` ✅

**Generated UI:**

- Simple mint button (no amount input)
- NFT balance counter
- Metadata viewer

</details>

---

## ✅ Smoke Test Checklist

Run through these steps to verify your generated dApp:

- [ ] **Setup**

  - [ ] Add Alchemy API key to `.env.local`
  - [ ] Add Celoscan API key to `.env.local`
  - [ ] Run `npm install`
  - [ ] Run `npm run dev`

- [ ] **Wallet Connection**

  - [ ] Open http://localhost:3000
  - [ ] Click "Connect Wallet"
  - [ ] MetaMask prompts for connection
  - [ ] Network auto-switches if needed
  - [ ] Wallet address displays

- [ ] **Balance Display**

  - [ ] Token balance loads automatically
  - [ ] Refresh button updates balance

- [ ] **Mint Function**

  - [ ] Amount input appears (if mint accepts amount)
  - [ ] OR simple button appears (if mint is address-only)
  - [ ] Click mint
  - [ ] Transaction hash displays
  - [ ] Link to Celoscan works
  - [ ] Balance updates after confirmation

- [ ] **Transfer Function**
  - [ ] Enter recipient address
  - [ ] Enter amount
  - [ ] Transaction succeeds
  - [ ] Balance decreases

---

## 🛠️ Development

### For Maintainers

The generator logic lives in `lib/frontend-generator.ts`. Key functions:

```typescript
// Main entry point
generateNextJsFrontend(contract: DeployedContract): FrontendFiles

// ABI helper
hasAbiFunction(contract: DeployedContract, name: string): boolean

// Component generators
generateLayout(contract)
generateMainPage(contract)
generateContractLib(contract)
generateWalletComponent(contract)
generateContractComponent(contract)  // ⭐ ABI-aware UI generation
```

### Running Tests

```powershell
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

---

## 🚦 Roadmap

- [x] ABI-aware function generation
- [x] Dual provider (MetaMask + Alchemy)
- [x] Celoscan transaction verification
- [x] Tailwind CSS integration
- [x] TypeScript support
- [ ] Event viewer component
- [ ] ERC-721 metadata display
- [ ] Multi-signature wallet support
- [ ] Automated testing suite
- [ ] CI/CD pipeline

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Celo Foundation** for the amazing blockchain infrastructure
- **Alchemy** for reliable RPC endpoints
- **Celoscan** for block explorer APIs
- **Next.js Team** for the incredible framework
- **ethers.js** for Ethereum interactions

---

## 📧 Support & Contact

- 🐛 **Issues**: [GitHub Issues](https://github.com/ROHIT8759/Low_-_No_Code_Platform_on_CELO/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ROHIT8759/Low_-_No_Code_Platform_on_CELO/discussions)
- 📧 **Email**: Contact via GitHub profile

---

<div align="center">
  
  ### ⭐ Star this repo if you find it useful!
  
  Made with ❤️ for the Celo ecosystem
  
  [⬆ Back to Top](#-lowno-code-platform-on-celo)
  
</div>
