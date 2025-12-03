import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Link from "next/link"
import { Menu } from "lucide-react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Camp Coach - Basketball Management",
  description: "Professional basketball camp management system for coaches",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                CC
              </div>
              <span className="hidden sm:inline">HoopFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
              <Link href="/sell-package" className="text-muted-foreground hover:text-foreground transition-colors">
                Packages
              </Link>
              <Link href="/check-in" className="text-muted-foreground hover:text-foreground transition-colors">
                Check-In
              </Link>
              <Link href="/players" className="text-muted-foreground hover:text-foreground transition-colors">
                Players
              </Link>
              <Link href="/expenses" className="text-muted-foreground hover:text-foreground transition-colors">
                Expenses
              </Link>
              <Link href="/summary" className="text-muted-foreground hover:text-foreground transition-colors">
                Summary
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {children}
        <Analytics />
      </body>
    </html>
  )
}
