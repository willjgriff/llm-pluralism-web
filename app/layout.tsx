import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Does AI get you?',
  description: 'Rate AI responses on contested topics and see how well AI performs for someone with your values.',
  generator: 'v0.app',
  openGraph: {
    title: 'Does AI get you?',
    description: 'Rate AI responses on contested topics and see how well AI performs for someone with your values.',
    url: '/',
    siteName: 'Does AI get you?',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Does AI get you? See how AI reflects your values.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Does AI get you?',
    description: 'Rate AI responses on contested topics and see how well AI performs for someone with your values.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/favicon-light.svg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-dark.svg',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
