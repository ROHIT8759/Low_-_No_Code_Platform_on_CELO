import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use Block Builder to create and deploy smart contracts. Comprehensive guides for ERC20 tokens, NFTs, DeFi, and frontend generation.",
  openGraph: {
    title: "Documentation | Block Builder",
    description: "Learn how to use Block Builder to create and deploy smart contracts on Celo blockchain",
    url: "https://celobuilder.vercel.app/docs",
  },
  twitter: {
    title: "Documentation | Block Builder",
    description: "Learn how to use Block Builder to create and deploy smart contracts on Celo blockchain",
  },
  alternates: {
    canonical: "https://celobuilder.vercel.app/docs",
  },
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
