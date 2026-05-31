import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], style: ['italic'], weight: ['700'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: {
    default: 'Photobooth Rental & Event Photography in Zamboanga City | Craftifyle',
    template: '%s | Craftifyle — Zamboanga City',
  },
  description: 'Photobooth rentals, event photography, and content creation for Zamboanga City\'s biggest moments. 50+ events covered. Book online and save ₱500.',
  keywords: [
    'photobooth rental Zamboanga City',
    'event photography Zamboanga City',
    'photobooth Philippines',
    'Craftifyle photobooth',
    'James Ignacio photographer',
    'event photographer Zamboanga',
    'photobooth rental Philippines',
    'content creation Zamboanga City',
    'graduation photobooth Zamboanga',
    'wedding photography Zamboanga City',
  ],
  authors: [{ name: 'James Ignacio' }],
  metadataBase: new URL('https://craftifyle.business'),
  alternates: { canonical: 'https://craftifyle.business/' },
  openGraph: {
    type: 'website',
    url: 'https://craftifyle.business/',
    title: 'Photobooth Rental & Event Photography in Zamboanga City | Craftifyle',
    description: 'Photobooth rentals, event photography, and content creation for Zamboanga City\'s biggest moments. 50+ events. Book online and save ₱500.',
    images: [{
      url: 'https://craftifyle.business/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Craftifyle — Photobooth & Event Photography in Zamboanga City',
    }],
    locale: 'en_PH',
    siteName: 'Craftifyle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photobooth Rental & Event Photography in Zamboanga City | Craftifyle',
    description: 'Photobooth rentals, event photography, and content creation for Zamboanga City\'s biggest moments. 50+ events. Book online and save ₱500.',
    images: ['https://craftifyle.business/images/og-image.jpg'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Craftifyle',
  url: 'https://craftifyle.business/',
  image: 'https://craftifyle.business/images/og-image.jpg',
  description: 'Photobooth service, event photography, and content creation for Zamboanga City\'s biggest moments. 50+ events covered.',
  telephone: '+639936324512',
  email: 'jamesignacio255@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zamboanga City',
    addressRegion: 'Zamboanga del Sur',
    addressCountry: 'PH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 6.9214,
    longitude: 122.0790,
  },
  areaServed: {
    '@type': 'City',
    name: 'Zamboanga City',
  },
  priceRange: '₱₱',
  founder: {
    '@type': 'Person',
    name: 'James Ignacio',
    email: 'jamesignacio255@gmail.com',
  },
  sameAs: [
    'https://www.facebook.com/craftifylePH',
    'https://www.facebook.com/james.ignacio.483443',
    'https://www.instagram.com/jamesignacioo/',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Event Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Photobooth Service' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Event Photography' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Content Creation' } },
    ],
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
