import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Learn how to use Celo Builder to create and deploy smart contracts. Comprehensive guides for ERC20 tokens, NFTs, DeFi, and frontend generation.",
  openGraph: {
    title: "Documentation | Celo Builder",
    description: "Learn how to use Celo Builder to create and deploy smart contracts on Celo blockchain",
    url: "https://celobuilder.vercel.app/docs",
  },
  twitter: {
    title: "Documentation | Celo Builder",
    description: "Learn how to use Celo Builder to create and deploy smart contracts on Celo blockchain",
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
