import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import GalleryCallout from '@/components/GalleryCallout'
import StatsStrip from '@/components/StatsStrip'
import Work from '@/components/Work'
import Services from '@/components/Services'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import Clients from '@/components/Clients'
import Testimonials from '@/components/Testimonials'
import About from '@/components/About'
import Blog from '@/components/Blog'
import Newsletter from '@/components/Newsletter'
import FAQ from '@/components/FAQ'
import Availability from '@/components/Availability'
import Contact from '@/components/Contact'
import NowStrip from '@/components/NowStrip'
import Footer from '@/components/Footer'
import MessengerFloat from '@/components/MessengerFloat'
import ScrollReveal from '@/components/ScrollReveal'
import PromoPopup from '@/components/PromoPopup'
import PromoBanner from '@/components/PromoBanner'

export default function Home() {
  return (
    <>
      <PromoBanner />
      <Nav />
      <main>
        <Hero />
        <GalleryCallout />
        <StatsStrip />
        <Work />
        <Services />
        <HowItWorks />
        <Pricing />
        <Clients />
        <Testimonials />
        <About />
        <Blog />
        <Newsletter />
        <FAQ />
        <Availability />
        <Contact />
      </main>
      <NowStrip />
      <Footer />
      <MessengerFloat />
      <ScrollReveal />
      <PromoPopup />
    </>
  )
}
