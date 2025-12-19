import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Smart Contract Builder",
    description: "Visual drag-and-drop builder for creating smart contracts on Celo. Build ERC20 tokens, NFTs, DeFi protocols, and more without writing code.",
    openGraph: {
        title: "Smart Contract Builder | Celo Builder",
        description: "Visual drag-and-drop builder for creating smart contracts on Celo blockchain",
        url: "https://celobuilder.vercel.app/builder",
    },
    twitter: {
        title: "Smart Contract Builder | Celo Builder",
        description: "Visual drag-and-drop builder for creating smart contracts on Celo blockchain",
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
