import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Celo No-Code Builder",
  description: "Build smart contracts without writing code",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Enable dark theme by default by adding the `dark` class on the <html> element.
    // This activates the `.dark { ... }` CSS variable overrides in `globals.css`.
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.className} bg-background text-foreground`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
