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
import ScrollReveal from '@/components/ScrollReveal'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatsStrip />
        <Services />
        <Pricing />
        <Work />
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
    </>
  )
}
