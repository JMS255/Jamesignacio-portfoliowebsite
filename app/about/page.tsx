import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import MessengerFloat from '@/components/MessengerFloat'

export const metadata: Metadata = {
  title: 'About James Ignacio — Craftifyle',
  description: 'Founder of Craftifyle, Zamboanga City photographer and photobooth operator. 18 months in, 50+ events covered.',
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 'var(--nav-h, 68px)' }}>
        <section className="about section" id="about">
          <div className="container about__inner">
            <div className="about__image">
              <div className="about__photo-placeholder">
                <span>Your photo</span>
              </div>
            </div>
            <div className="about__text">
              <p className="section__label">About me</p>
              <h1 className="about__name">James<br /><em>Ignacio.</em></h1>
              <p className="about__bio">
                I grew up selling ice cream in grade school to make pocket money. I was always the kid looking for a way to earn, to build something. When I got a scholarship in college, I didn&rsquo;t save the money — I bet it on an idea. That idea became Craftifyle.
              </p>
              <p className="about__bio">
                It wasn&rsquo;t a straight line. I launched a t-shirt brand, a stationery business, a car detailing service — most of them failed. I spread myself too thin and learned hard lessons about focus. But the photobooth survived, because I kept showing up and kept improving.
              </p>
              <p className="about__bio">
                Now, 18 months in, I&rsquo;m the photographer behind 50+ events in Zamboanga City — grand openings, corporate launches, graduations, and everything in between. Through{' '}
                <a href="https://www.facebook.com/craftifylePH" className="link" target="_blank" rel="noopener noreferrer">Craftifyle</a>,
                {' '}I help other businesses build a visual identity they&rsquo;re proud of.
              </p>
              <div className="about__tags">
                {['Photography', 'Web Design', 'Content Creation', 'Branding', 'Zamboanga City'].map(t => (
                  <span key={t} className="label-tag">{t}</span>
                ))}
              </div>
              <Link href="/booking" className="btn btn--consult" style={{ marginTop: '36px', display: 'inline-flex' }}>
                Work with me →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MessengerFloat />
    </>
  )
}
