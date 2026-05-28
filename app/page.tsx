'use client'

import { useState } from 'react'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import StatsStrip from '@/components/StatsStrip'
import Services from '@/components/Services'
import Pricing from '@/components/Pricing'
import Work from '@/components/Work'
import Clients from '@/components/Clients'
import Testimonials from '@/components/Testimonials'
import Blog from '@/components/Blog'
import Playbooks from '@/components/Playbooks'
import About from '@/components/About'
import Newsletter from '@/components/Newsletter'
import FAQ from '@/components/FAQ'
import Availability from '@/components/Availability'
import Contact from '@/components/Contact'
import NowStrip from '@/components/NowStrip'
import Footer from '@/components/Footer'
import MessengerFloat from '@/components/MessengerFloat'
import Lightbox from '@/components/Lightbox'
import ScrollReveal from '@/components/ScrollReveal'

export default function Home() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  function openLightbox(imgs: string[], idx: number) {
    setLightboxImages(imgs)
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  return (
    <>
      <Nav />

      <main>
        <Hero />
        <StatsStrip />
        <Services />
        <Pricing />
        <Work onLightboxOpen={openLightbox} />
        <Clients />
        <Testimonials />
        <Blog />
        <Playbooks />
        <About />
        <Newsletter />
        <FAQ />
        <Availability />
        <Contact />
      </main>

      <NowStrip />
      <Footer />
      <MessengerFloat />
      <ScrollReveal />

      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex(i => Math.max(0, i - 1))}
          onNext={() => setLightboxIndex(i => Math.min(lightboxImages.length - 1, i + 1))}
        />
      )}
    </>
  )
}
