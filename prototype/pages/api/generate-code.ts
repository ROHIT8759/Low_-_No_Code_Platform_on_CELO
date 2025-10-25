import type { NextApiRequest, NextApiResponse } from 'next'
import { generateCode, Block } from '../../lib/generator'

type GenerateCodeRequest = {
  blocks: Block[]
}

type GenerateCodeResponse = {
  success: boolean
  solidity?: string
  react?: string
  contractName?: string
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateCodeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const { blocks } = req.body as GenerateCodeRequest

    if (!blocks || !Array.isArray(blocks)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: blocks array is required',
      })
    }

    // Generate code from blocks
    const generated = generateCode(blocks)

    return res.status(200).json({
      success: true,
      solidity: generated.solidity,
      react: generated.react,
      contractName: generated.contractName,
    })
  } catch (error) {
    console.error('Code generation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to generate code',
    })
  }
}
