import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

const siteUrl = "https://celobuilder.vercel.app"
const siteName = "Block Builder"
const siteDescription = "Build and deploy smart contracts on Celo blockchain without writing code. Visual drag-and-drop builder for ERC20 tokens, NFTs, DeFi, and more. Generate production-ready Next.js frontends instantly."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - No-Code Smart Contract Builder for Celo Blockchain`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Celo",
    "blockchain",
    "smart contracts",
    "no-code",
    "low-code",
    "dApp builder",
    "ERC20",
    "NFT",
    "DeFi",
    "Web3",
    "Solidity",
    "Next.js",
    "crypto",
    "token creator",
    "NFT minting",
    "Celo network",
    "Alfajores testnet",
    "smart contract generator",
    "visual builder",
    "drag and drop",
  ],
  authors: [{ name: "Block Builder Team", url: siteUrl }],
  creator: "Block Builder",
  publisher: "Block Builder",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - No-Code Smart Contract Builder`,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Block Builder - Visual Smart Contract Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - No-Code Smart Contract Builder`,
    description: siteDescription,
    images: ["/og-image.png"],
    creator: "@celobuilder",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
  classification: "Web3 Development Tools",
  verification: {
    google: "google38dae9c721beb4cc",
    yandex: "yandex-verification=YOUR_VERIFICATION_CODE",
    yahoo: "yahoo-site-verification=YOUR_VERIFICATION_CODE",
    other: {
      "msvalidate.01": "YOUR_BING_VERIFICATION_CODE",
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#06b6d4" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

import ThreeBackground from "@/components/ThreeBackground"
import CustomCursor from "@/components/CustomCursor"

// ... (keep existing code)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Block Builder",
    description: "Build and deploy smart contracts on Celo blockchain without writing code",
    url: "https://celobuilder.vercel.app",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Block Builder Team",
    },
    featureList: [
      "Visual drag-and-drop smart contract builder",
      "ERC20 token creation",
      "NFT (ERC721) minting",
      "DeFi contract templates",
      "Automatic frontend generation",
      "Celo Mainnet and Alfajores testnet support",
      "MetaMask wallet integration",
    ],
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://celobuilder.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Builder",
        item: "https://celobuilder.vercel.app/builder",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Documentation",
        item: "https://celobuilder.vercel.app/docs",
      },
    ],
  }

  return (
    // Enable dark theme by default by adding the `dark` class on the <html> element.
    // This activates the `.dark { ... }` CSS variable overrides in `globals.css`.
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </head>
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <CustomCursor />
        <ThreeBackground />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
