"use client"

import JSZip from "jszip"
import type { Block } from "./store"
import { generateFrontendWithGemini } from "./gemini"

export async function generateEnhancedFrontend(
  solidityCode: string,
  abi: any[],
  contractAddress: string,
  contractName: string,
  contractType: "erc20" | "nft",
  blocks: Block[],
  network: "sepolia" | "mainnet" = "sepolia"
): Promise<Blob> {
  let frontendFiles: Record<string, string>

  // Try to use Gemini API if available
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    try {
      const geminiResponse = await generateFrontendWithGemini(
        solidityCode,
        abi,
        contractAddress,
        contractName,
        contractType,
        blocks
      )

      // Parse the Gemini response
      frontendFiles = JSON.parse(geminiResponse)
    } catch (error) {
      console.error('Gemini API failed, using fallback generator:', error)
      frontendFiles = generateFallbackFrontend(solidityCode, abi, contractAddress, contractName, contractType, blocks, network)
    }
  } else {
    // Use fallback generator if no Gemini API key
    frontendFiles = generateFallbackFrontend(solidityCode, abi, contractAddress, contractName, contractType, blocks, network)
  }

  // Create ZIP file
  const zip = new JSZip()

  // Add all files to ZIP
  Object.entries(frontendFiles).forEach(([path, content]) => {
    zip.file(path, content)
  })

  // Add README
  zip.file(
    "README.md",
    `# ${contractName} dApp

This is an automatically generated Next.js dApp for the ${contractName} smart contract.

## Features
${blocks.map((b) => `- ${b.type}`).join("\n")}

## Setup

1. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

2. Update the contract address in \`lib/contract.ts\` if needed

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Contract Details

- **Address**: \`${contractAddress}\`
- **Network**: Celo ${network === "sepolia" ? "Sepolia Testnet" : "Mainnet"}
- **Type**: ${contractType.toUpperCase()}

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- ethers.js v6
- Celo Blockchain

## License

MIT
`
  )

  return await zip.generateAsync({ type: "blob" })
}

function generateFallbackFrontend(
  solidityCode: string,
  abi: any[],
  contractAddress: string,
  contractName: string,
  contractType: "erc20" | "nft",
  blocks: Block[],
  network: "sepolia" | "mainnet"
): Record<string, string> {
  const chainId = network === "sepolia" ? 11142220 : 42220
  const rpcUrl = network === "sepolia" 
    ? "https://forno.celo-sepolia.celo-testnet.org/" 
    : "https://forno.celo.org/"

  return {
    "package.json": JSON.stringify({
      name: `${contractName.toLowerCase().replace(/\\s+/g, "-")}-dapp`,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        "next": "^14.0.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "ethers": "^6.9.0",
        "lucide-react": "^0.300.0",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "autoprefixer": "^10",
        "postcss": "^8",
        "tailwindcss": "^3.3.0",
        "typescript": "^5",
      },
    }, null, 2),

    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }, null, 2),

    "tailwind.config.ts": `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        celo: {
          green: "#35D07F",
          yellow: "#FBCC5C",
          gold: "#F2C94C",
        },
      },
    },
  },
  plugins: [],
};

export default config;
`,

    "postcss.config.js": `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

    "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,

    "lib/contract.ts": `import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "${contractAddress}";
export const CHAIN_ID = ${chainId};
export const RPC_URL = "${rpcUrl}";

export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};

export async function getContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
`,

    "app/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
`,

    "app/layout.tsx": `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${contractName} dApp",
  description: "Decentralized application for ${contractName}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,

    "app/page.tsx": generateMainPage(contractName, contractType, blocks),

    "components/WalletConnect.tsx": generateWalletComponent(),

    "components/ContractInteraction.tsx": generateContractInteraction(contractName, contractType, blocks),
  }
}

function generateMainPage(contractName: string, contractType: string, blocks: Block[]): string {
  return `"use client";

import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { ContractInteraction } from "@/components/ContractInteraction";
import { CONTRACT_ADDRESS } from "@/lib/contract";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">${contractName}</h1>
            <p className="text-gray-400">${contractType.toUpperCase()} Token</p>
          </div>
          <WalletConnect 
            onConnect={(address) => {
              setWalletAddress(address);
              setIsConnected(true);
            }}
          />
        </div>

        {/* Contract Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Contract Address</p>
              <p className="text-celo-green font-mono text-sm break-all">{CONTRACT_ADDRESS}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Network</p>
              <p className="text-white">Celo Sepolia Testnet</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {isConnected ? (
          <ContractInteraction walletAddress={walletAddress!} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Connect your wallet to interact with the contract</p>
          </div>
        )}
      </div>
    </main>
  );
}
`;
}

function generateWalletComponent(): string {
  return `"use client";

import { useState } from "react";
import { BrowserProvider } from "ethers";
import { CHAIN_ID } from "@/lib/contract";

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== CHAIN_ID) {
        await switchToCorrectNetwork();
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      setAddress(userAddress);
      onConnect(userAddress);
    } catch (error) {
      console.error("Failed to connect:", error);
      alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToCorrectNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: \`0x\${CHAIN_ID.toString(16)}\` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: \`0x\${CHAIN_ID.toString(16)}\`,
            chainName: "Celo Sepolia Testnet",
            nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
            rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org/"],
            blockExplorerUrls: ["https://celo-sepolia.blockscout.com/"],
          }],
        });
      }
    }
  };

  if (address) {
    return (
      <div className="bg-celo-green text-gray-900 px-6 py-3 rounded-lg font-medium">
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-gradient-to-r from-celo-green to-celo-yellow hover:opacity-90 text-gray-900 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
`;
}

function generateContractInteraction(contractName: string, contractType: string, blocks: Block[]): string {
  const features = blocks.map(b => b.type).filter(t => !['erc20', 'nft'].includes(t));

  return `"use client";

import { useState } from "react";
import { BrowserProvider, parseEther, formatEther } from "ethers";
import { getContract } from "@/lib/contract";

interface ContractInteractionProps {
  walletAddress: string;
}

export function ContractInteraction({ walletAddress }: ContractInteractionProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("0");

  const showStatus = (message: string, isError = false) => {
    setStatus(message);
    setTimeout(() => setStatus(""), 5000);
  };

  const getContractInstance = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return getContract(signer);
  };

  const checkBalance = async () => {
    setLoading(true);
    try {
      const contract = await getContractInstance();
      const bal = await contract.balanceOf(walletAddress);
      setBalance(formatEther(bal));
      showStatus("Balance updated!");
    } catch (error: any) {
      showStatus("Failed to get balance: " + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  ${features.includes('mint') ? `
  const mintTokens = async (to: string, amount: string) => {
    setLoading(true);
    try {
      const contract = await getContractInstance();
      const tx = await contract.mint(to, parseEther(amount));
      await tx.wait();
      showStatus(\`✅ Minted \${amount} tokens to \${to}\`);
      checkBalance();
    } catch (error: any) {
      showStatus("Mint failed: " + error.message, true);
    } finally {
      setLoading(false);
    }
  };
  ` : ''}

  ${features.includes('burn') ? `
  const burnTokens = async (amount: string) => {
    setLoading(true);
    try {
      const contract = await getContractInstance();
      const tx = await contract.burn(parseEther(amount));
      await tx.wait();
      showStatus(\`✅ Burned \${amount} tokens\`);
      checkBalance();
    } catch (error: any) {
      showStatus("Burn failed: " + error.message, true);
    } finally {
      setLoading(false);
    }
  };
  ` : ''}

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      {status && (
        <div className={\`p-4 rounded-lg \${status.includes('Failed') || status.includes('failed') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}\`}>
          {status}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Your Balance</h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-celo-green">{balance}</p>
            <p className="text-gray-400 mt-1">${contractType === 'erc20' ? 'Tokens' : 'NFTs'}</p>
          </div>
          <button
            onClick={checkBalance}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${features.map(feature => generateFeatureCard(feature)).join('\n')}
      </div>
    </div>
  );
}
`;
}

function generateFeatureCard(feature: string): string {
  switch (feature) {
    case 'mint':
      return `
        {/* Mint Feature */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Mint Tokens</h3>
          <input
            type="text"
            placeholder="Recipient Address"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-2"
            id="mintTo"
          />
          <input
            type="number"
            placeholder="Amount"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4"
            id="mintAmount"
          />
          <button
            onClick={() => {
              const to = (document.getElementById('mintTo') as HTMLInputElement).value;
              const amount = (document.getElementById('mintAmount') as HTMLInputElement).value;
              mintTokens(to, amount);
            }}
            disabled={loading}
            className="w-full bg-celo-green hover:bg-celo-green/90 text-gray-900 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            Mint
          </button>
        </div>`;
    
    case 'burn':
      return `
        {/* Burn Feature */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Burn Tokens</h3>
          <input
            type="number"
            placeholder="Amount to Burn"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg mb-4"
            id="burnAmount"
          />
          <button
            onClick={() => {
              const amount = (document.getElementById('burnAmount') as HTMLInputElement).value;
              burnTokens(amount);
            }}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            Burn
          </button>
        </div>`;

    default:
      return `
        {/* ${feature} Feature */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">${feature.charAt(0).toUpperCase() + feature.slice(1)}</h3>
          <p className="text-gray-400">Coming soon...</p>
        </div>`;
  }
}

export { generateFallbackFrontend };
