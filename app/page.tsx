import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Photobooth Service & Event Photography in Zamboanga City | Craftifyle',
  description: 'Zamboanga City\'s go-to photobooth service and event photography. 50+ events covered including Kenny Rogers Roasters, ADZU Fiesta, and more. Book online and save ₱500.',
  alternates: { canonical: 'https://craftifyle.business/' },
}

import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import StatsStrip from '@/components/StatsStrip'
import CraftifyleServices from '@/components/CraftifyleServices'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import Work from '@/components/Work'
import Testimonials from '@/components/Testimonials'
import BioStrip from '@/components/BioStrip'
import FreelanceServices from '@/components/FreelanceServices'
import FAQ from '@/components/FAQ'
import Availability from '@/components/Availability'
import Contact from '@/components/Contact'
import NowStrip from '@/components/NowStrip'
import Footer from '@/components/Footer'
import MessengerFloat from '@/components/MessengerFloat'
import ScrollReveal from '@/components/ScrollReveal'
import PromoBanner from '@/components/PromoBanner'

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Nav />
      <main>
        <Hero />
        <StatsStrip />
        <CraftifyleServices />
        <HowItWorks />
        <Pricing />
        <Work />
        <Testimonials />
        <BioStrip />
        <FreelanceServices />
        <FAQ />
        <Availability />
        <Contact />
      </main>
      <NowStrip />
      <Footer />
      <MessengerFloat />
      <ScrollReveal />
    </>
  )
}
