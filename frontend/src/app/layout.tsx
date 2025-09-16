// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AI Restaurant Assistant',
  description: 'Revolutionary AI-powered restaurant order management system with voice and chat capabilities'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white antialiased transition-colors duration-300">
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
