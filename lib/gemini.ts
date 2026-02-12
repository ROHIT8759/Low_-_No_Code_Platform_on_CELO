import { GoogleGenerativeAI } from '@google/generative-ai'
import { STELLAR_NETWORKS } from './stellar/stellar-config'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

export async function generateFrontendWithGemini(
  contractCode: string,
  contractABI: any[],
  contractAddress: string,
  contractName: string,
  contractType: 'erc20' | 'nft',
  blocks: any[]
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const features = blocks.map(b => b.type).join(', ')
  
  const prompt = `
You are an expert frontend developer specializing in Web3 dApps. Generate a complete, production-ready Next.js frontend for a smart contract.

**Contract Details:**
- Name: ${contractName}
- Type: ${contractType.toUpperCase()}
- Address: ${contractAddress}
- Features: ${features}

**Contract ABI:**
\`\`\`json
${JSON.stringify(contractABI, null, 2)}
\`\`\`

**Contract Code:**
\`\`\`solidity
${contractCode}
\`\`\`

**Requirements:**
1. Create a modern, responsive Next.js application using:
   - TypeScript
   - Tailwind CSS for styling
   - @stellar/stellar-sdk for blockchain interaction
   - React hooks for state management

2. Include the following features:
   - Wallet connection (Freighter for Stellar)
   - Network detection and switching to Stellar Testnet/Mainnet
   - Display contract information
   - Interactive UI for all contract functions (${features})
   - Transaction status notifications
   - Error handling
   - Loading states
   - Responsive design with beautiful gradients

3. Use Stellar SDK (@stellar/stellar-sdk) for blockchain interaction:
   - Connect to Stellar network
   - Use network passphrase: "Test SDF Network ; September 2015" for testnet or "Public Global Stellar Network ; September 2015" for mainnet
   - Handle XLM transactions
   - Support contract ID format for Soroban contracts
   - Use Freighter wallet for signing

4. Use modern UI patterns:
   - Card-based layout
   - Gradient backgrounds
   - Smooth animations
   - Icons (lucide-react)
   - Toast notifications

5. Code structure:
   - Main page component in pages/index.tsx
   - Separate components for wallet connection, contract interaction
   - Utility functions for contract calls
   - Proper TypeScript types

Generate ONLY the complete Next.js application code. Return a JSON object with the following structure:
{
  "pages/index.tsx": "...",
  "components/WalletConnect.tsx": "...",
  "components/ContractInteraction.tsx": "...",
  "lib/contract.ts": "...",
  "lib/utils.ts": "...",
  "package.json": "...",
  "tailwind.config.js": "...",
  "tsconfig.json": "..."
}

Make it production-ready, beautiful, and fully functional.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return jsonMatch[0]
    }
    
    return text
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate frontend with Gemini AI')
  }
}

export async function enhanceSmartContract(
  contractCode: string,
  contractType: string,
  additionalFeatures: string[]
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
You are an expert Solidity developer. Enhance the following smart contract by adding these features: ${additionalFeatures.join(', ')}

**Current Contract:**
\`\`\`solidity
${contractCode}
\`\`\`

**Requirements:**
1. Add the requested features while maintaining security best practices
2. Use OpenZeppelin contracts where applicable
3. Include proper error handling and events
4. Add comprehensive NatSpec documentation
5. Ensure gas optimization
6. Maintain backward compatibility with existing functions

Return ONLY the enhanced Solidity code, no explanations.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to enhance contract with Gemini AI')
  }
}

export async function generateContractDocumentation(
  contractCode: string,
  contractName: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
Generate comprehensive documentation for the following smart contract in Markdown format.

**Contract Code:**
\`\`\`solidity
${contractCode}
\`\`\`

**Include:**
1. Contract Overview
2. Features & Functionality
3. Function Reference (all public/external functions with parameters and return values)
4. Events
5. Security Considerations
6. Usage Examples with ethers.js
7. Deployment Guide

Make it clear, professional, and developer-friendly.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate documentation with Gemini AI')
  }
}

export async function optimizeContractGas(contractCode: string): Promise<{
  optimizedCode: string
  suggestions: string[]
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
Analyze the following Solidity contract for gas optimization opportunities and provide an optimized version.

**Contract Code:**
\`\`\`solidity
${contractCode}
\`\`\`

Return a JSON object with:
{
  "optimizedCode": "... optimized Solidity code ...",
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}

Focus on:
- Storage optimization
- Loop optimization
- Function visibility
- Data types
- Caching
- Batch operations
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return {
      optimizedCode: contractCode,
      suggestions: ['Unable to parse optimization suggestions']
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to optimize contract with Gemini AI')
  }
}

export async function explainContract(contractCode: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
Explain the following smart contract in simple, non-technical terms that anyone can understand.

**Contract Code:**
\`\`\`solidity
${contractCode}
\`\`\`

Provide:
1. What this contract does (in simple terms)
2. Who can use it
3. Main features
4. How it works (step by step)
5. Security features

Use analogies and avoid jargon where possible.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to explain contract with Gemini AI')
  }
}
