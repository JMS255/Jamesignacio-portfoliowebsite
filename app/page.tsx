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
import ConsultModal from '@/components/ConsultModal'
import Lightbox from '@/components/Lightbox'
import ScrollReveal from '@/components/ScrollReveal'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalService, setModalService] = useState('')
  const [modalDate, setModalDate] = useState('')

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  function openModal(service = '', date = '') {
    setModalService(service)
    setModalDate(date)
    setModalOpen(true)
  }

  function openLightbox(imgs: string[], idx: number) {
    setLightboxImages(imgs)
    setLightboxIndex(idx)
    setLightboxOpen(true)
  }

  return (
    <>
      <Nav onOpenModal={() => openModal()} />

      <main>
        <Hero onOpenModal={() => openModal()} />
        <StatsStrip />
        <Services onOpenModal={openModal} />
        <Pricing onOpenModal={openModal} />
        <Work onLightboxOpen={openLightbox} />
        <Clients />
        <Testimonials />
        <Blog />
        <Playbooks />
        <About onOpenModal={() => openModal()} />
        <Newsletter />
        <FAQ />
        <Availability />
        <Contact onOpenModal={() => openModal()} />
      </main>

      <NowStrip />
      <Footer />
      <MessengerFloat />
      <ScrollReveal />

      {modalOpen && (
        <ConsultModal
          preselect={modalService}
          predate={modalDate}
          onClose={() => setModalOpen(false)}
        />
      )}

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
