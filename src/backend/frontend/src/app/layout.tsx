import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Providers from "@/providers"
import type { Metadata } from "next"
import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { DM_Mono as Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import { Analytics } from "@vercel/analytics/react"
import { Sidebar } from "@/components/sidebar"

const mono = Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

const title = "Cortex"
const description = "Cortex - AI powered answer engine with intelligent search capabilities."

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000/"),
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: "summary_large_image",
    creator: "@rashadphz",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body className={cn("antialiased h-full", GeistSans.className, mono.className)}>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <div className="flex h-full">
                <Sidebar />
                {/* Remove overflow-y-auto from main to let child components handle scrolling */}
                <main className="flex-1 relative">{children}</main>
              </div>
              <Toaster />
              <Analytics />
            </ThemeProvider>
          </Providers>
        </body>
      </html>
    </>
  )
}

