import { solidityTemplates, reactTemplates } from './solidityTemplates';

export type BlockType = 'erc20' | 'nft' | 'payment' | 'stake' | 'governance';

export type Block = {
  id: string;
  type: BlockType;
  label: string;
  config?: Record<string, string>;
};

export interface GeneratedCode {
  solidity: string;
  react: string;
  contractName: string;
}

/**
 * Generate Solidity and React code from placed blocks
 */
export function generateCode(blocks: Block[]): GeneratedCode {
  if (blocks.length === 0) {
    return {
      solidity: '// No blocks placed yet. Drag blocks from the toolbox to begin.',
      react: '// No blocks placed yet. Drag blocks from the toolbox to begin.',
      contractName: 'EmptyContract',
    };
  }

  let solidity = '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\n';
  let react = 'import { useState } from "react";\n\n';
  let contractName = 'GeneratedContract';

  // Process each placed block
  blocks.forEach((block) => {
    if (block.type === 'erc20') {
      const config = (block.config || { 
        name: 'MyToken', 
        symbol: 'MTK', 
        initialSupply: '1000000' 
      }) as { name: string; symbol: string; initialSupply: string };
      
      contractName = `${config.name.replace(/[^a-zA-Z0-9]/g, '')}Token`;
      solidity += solidityTemplates.erc20(config);
      react += reactTemplates.erc20(config);
    } 
    else if (block.type === 'nft') {
      const config = (block.config || { 
        name: 'MyNFT', 
        symbol: 'MNFT',
        baseUri: 'https://ipfs.io/ipfs/'
      }) as { name: string; symbol: string; baseUri?: string };
      
      contractName = `${config.name.replace(/[^a-zA-Z0-9]/g, '')}NFT`;
      solidity += solidityTemplates.nft(config);
      react += reactTemplates.nft(config);
    } 
    else if (block.type === 'payment') {
      solidity += solidityTemplates.payment();
      react += reactTemplates.payment();
      contractName = 'SimplePayment';
    }
    else if (block.type === 'stake') {
      solidity += solidityTemplates.stake();
      contractName = 'SimpleStaking';
    }
    else if (block.type === 'governance') {
      solidity += solidityTemplates.governance();
      contractName = 'SimpleGovernance';
    }
  });

  return {
    solidity,
    react,
    contractName,
  };
}

/**
 * Generate Solidity code from node list (backwards compatible with existing UI)
 */
export function generateSolidityFromNodes(nodes: Array<{
  id: string;
  type: string;
  props: Record<string, any>;
}>): string {
  if (nodes.length === 0) {
    return '// Drop components to generate contract code';
  }

  const blocks: Block[] = nodes.map(node => ({
    id: node.id,
    type: node.type as BlockType,
    label: node.type.toUpperCase(),
    config: node.props
  }));

  const { solidity } = generateCode(blocks);
  return solidity;
}

/**
 * Get a minimal Solidity preview (truncated for display)
 */
export function getSolidityPreview(blocks: Block[]): string {
  const { solidity } = generateCode(blocks);
  const lines = solidity.split('\n');
  return lines.slice(0, 30).join('\n') + (lines.length > 30 ? '\n\n// ... (truncated)' : '');
}
