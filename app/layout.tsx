import type React from "react"
import type { Metadata, Viewport } from "next"
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
})

const siteUrl = "https://blockbuilder.dev"
const siteName = "Block Builder"
const siteDescription = "Infrastructure-grade smart contract builder for Stellar Soroban and EVM blockchains. Visual development platform with formal verification, WASM-native compilation, and production-ready deployment pipeline."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Infrastructure-Grade Smart Contract Platform`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Stellar",
    "Soroban",
    "WASM",
    "Rust",
    "smart contracts",
    "blockchain infrastructure",
    "formal verification",
    "contract builder",
    "EVM",
    "Solidity",
    "Web3",
    "DeFi",
    "token deployment",
    "mainnet ready",
    "production deployment",
    "contract workstation",
    "blockchain development",
    "infrastructure platform",
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
    title: `${siteName} - Infrastructure-Grade Smart Contract Platform`,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Block Builder - Infrastructure-Grade Contract Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Infrastructure-Grade Smart Contract Platform`,
    description: siteDescription,
    images: ["/og-image.png"],
    creator: "@blockbuilder",
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

import { NetworkProvider } from "@/lib/multi-chain/network-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
    ],
  }

  return (
    
    
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
      <body suppressHydrationWarning className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} bg-background text-foreground`}>
        <NetworkProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </NetworkProvider>
      </body>
    </html>
  )
}
