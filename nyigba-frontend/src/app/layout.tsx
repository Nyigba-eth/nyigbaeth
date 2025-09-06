import '@/styles/globals.css'
import '@/utils/devWarningFilter' // Import development warning filter
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from './providers'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nyigba.eth'),
  title: 'Nyigba.eth - Preserving African Heritage Onchain',
  description: 'A Web3 cultural heritage platform that leverages ENS, NFTs, DAOs, and decentralized storage to preserve African culture.',
  keywords: ['Web3', 'NFT', 'African Culture', 'Heritage', 'DAO', 'ENS', 'IPFS'],
  authors: [{ name: 'Nyigba.eth Team' }],
  creator: 'Nyigba.eth',
  publisher: 'Nyigba.eth',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nyigba.eth',
    title: 'Nyigba.eth - Preserving African Heritage Onchain',
    description: 'A Web3 cultural heritage platform that leverages ENS, NFTs, DAOs, and decentralized storage to preserve African culture.',
    siteName: 'Nyigba.eth',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nyigba.eth - Preserving African Heritage Onchain',
    description: 'A Web3 cultural heritage platform that leverages ENS, NFTs, DAOs, and decentralized storage to preserve African culture.',
    creator: '@nyigba_eth',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#dc5f52',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
