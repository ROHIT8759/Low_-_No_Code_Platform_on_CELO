import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Smart Contract Builder | Block Builder",
    description: "Visual no-code builder for Stellar/Soroban smart contracts. Drag-and-drop blocks to create tokens, NFTs, governance, and DeFi protocols — deploy directly to Stellar testnet.",
    openGraph: {
        title: "Smart Contract Builder | Block Builder",
        description: "Visual no-code builder for Stellar/Soroban smart contracts",
    },
    twitter: {
        title: "Smart Contract Builder | Block Builder",
        description: "Visual no-code builder for Stellar/Soroban smart contracts",
    },
}

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
