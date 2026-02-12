import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Smart Contract Builder",
    description: "Visual drag-and-drop builder for creating smart contracts on Stellar (Soroban) and EVM blockchains. Build tokens, NFTs, DeFi protocols, and more without writing code.",
    openGraph: {
        title: "Smart Contract Builder | Block Builder",
        description: "Visual drag-and-drop builder for creating smart contracts on blockchain",
        url: "https://celobuilder.vercel.app/builder",
    },
    twitter: {
        title: "Smart Contract Builder | Block Builder",
        description: "Visual drag-and-drop builder for creating smart contracts on blockchain",
    },
    alternates: {
        canonical: "https://celobuilder.vercel.app/builder",
    },
}

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
