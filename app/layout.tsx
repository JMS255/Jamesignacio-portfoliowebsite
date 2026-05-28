import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], style: ['italic'], weight: ['700'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'James Ignacio — Photographer & Founder | Zamboanga City',
  description: 'James Ignacio is a photographer and entrepreneur based in Zamboanga City, Philippines. Founder of Craftifyle — event photography, photobooth rentals, and content creation.',
  keywords: 'James Ignacio, Craftifyle, photographer Zamboanga City, event photography Philippines, photobooth rental Zamboanga, content creation, personal branding photographer',
  authors: [{ name: 'James Ignacio' }],
  metadataBase: new URL('https://craftifyle.business'),
  alternates: { canonical: 'https://craftifyle.business/' },
  openGraph: {
    type: 'website',
    url: 'https://craftifyle.business/',
    title: 'James Ignacio — Photographer & Founder | Zamboanga City',
    description: 'Photographer, entrepreneur, and founder of Craftifyle. Event photography, photobooth rentals, and content creation in Zamboanga City.',
    images: [{ url: 'https://craftifyle.business/images/craftifyle.png' }],
    locale: 'en_PH',
    siteName: 'James Ignacio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'James Ignacio — Photographer & Founder | Zamboanga City',
    description: 'Photographer, entrepreneur, and founder of Craftifyle. Event photography, photobooth rentals, and content creation in Zamboanga City.',
    images: ['https://craftifyle.business/images/craftifyle.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'James Ignacio',
  url: 'https://craftifyle.business/',
  image: 'https://craftifyle.business/images/craftifyle.png',
  jobTitle: 'Photographer & Entrepreneur',
  description: 'Photographer, entrepreneur, and founder of Craftifyle based in Zamboanga City, Philippines.',
  email: 'jamesignacio255@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zamboanga City',
    addressCountry: 'PH',
  },
  sameAs: [
    'https://www.facebook.com/james.ignacio.483443',
    'https://www.instagram.com/jamesignacioo/',
    'https://www.facebook.com/craftifylePH',
  ],
  founder: {
    '@type': 'Organization',
    name: 'Craftifyle',
    url: 'https://www.facebook.com/craftifylePH',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0ZKD4Y3PF6"
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0ZKD4Y3PF6');
        `}</Script>
      </body>
    </html>
  )
}
