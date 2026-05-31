'use client'

import { useState } from 'react'
import Lightbox from './Lightbox'

type Filter = 'all' | 'photography' | 'web'

const photoCards = [
  {
    img: '/images/kenny-rogers.jpg',
    alt: 'Kenny Rogers Roasters grand opening',
    tag: 'Commercial Photography',
    title: "Kenny Rogers Roasters — SM City Zamboanga",
    challenge: 'Document a high-profile commercial grand opening professionally.',
    result: 'Clean, commercial-grade interior and event photos delivered within 48 hours.',
  },
  {
    img: '/images/Mahad-school.jpg',
    alt: 'Mahad school recognition day',
    tag: 'Event Photography',
    title: "Mahad Al-Qur'an Wal Hadith — Full Coverage",
    challenge: 'School recognition ceremony professionally with real emotional moments captured.',
    result: 'School administration used photos for official records and social media.',
  },
  {
    img: '/images/wedding-baginda.png',
    alt: 'Napsa Baginda school event',
    tag: 'Brand Photography',
    title: 'Napsa Baginda — School Event Series',
    challenge: 'Build an ongoing photography partnership with a school for multiple events.',
    result: "Covered wedding, graduation, and recognition day. Became Craftifyle's first recurring client.",
  },
]

const webCards = [
  {
    url: 'https://santiagoeismavantours.netlify.app',
    img: '/images/web/santi-drivingwebsite.png',
    alt: 'Santiago Van Tours website',
    tag: 'Web Design',
    title: 'Travel and Tours website',
    what: 'Built a professional portfolio and booking system website for a client',
    tools: 'HTML, CSS, JavaScript',
  },
  {
    url: 'https://laagan-adventure.vercel.app',
    img: '/images/web/laagan-website.png',
    alt: 'Laagan Adventure tour booking website',
    tag: 'Web Design',
    title: 'Laagan Adventure — Tour Booking Website',
    what: 'Full tour booking website for a Zamboanga City-based tour operator. Sanity CMS, GCash payments via Xendit, booking dashboard, and Trip Builder.',
    tools: 'Next.js, Sanity, TypeScript, Xendit',
  },
  {
    url: 'https://craftycrm-website.vercel.app',
    img: '/images/web/craftycrm-website.png',
    alt: 'CraftyCRM — CRM for Filipino service businesses',
    tag: 'SaaS / Founder',
    title: 'CraftyCRM — Built for Filipino service businesses',
    what: 'CRM I built to manage leads, bookings, and finances — with AI that replies to clients in Taglish on Messenger, 24/7. Currently in beta.',
    tools: 'Next.js, Supabase, AI',
  },
]

export default function Work() {
  const [filter, setFilter]       = useState<Filter>('all')
  const [lbOpen, setLbOpen]       = useState(false)
  const [lbImages, setLbImages]   = useState<string[]>([])
  const [lbIndex, setLbIndex]     = useState(0)

  function openLightbox(imgs: string[], idx: number) {
    setLbImages(imgs); setLbIndex(idx); setLbOpen(true)
  }

  const allPhotoImgs = photoCards.map(c => c.img)

  return (
    <>
    <section className="work section section--alt" id="work">
      <div className="container">
        <p className="section__label">Portfolio</p>
        <h2 className="section__title">Work I&rsquo;m proud of.</h2>

        <div className="work-filter">
          {(['all', 'photography', 'web'] as Filter[]).map(f => (
            <button
              key={f}
              className={`work-filter__btn${filter === f ? ' work-filter__btn--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'photography' ? 'Photography' : 'Web Design'}
            </button>
          ))}
        </div>

        {/* Craftifyle feature */}
        <div className="feature-block" id="craftifyle">
          <div className="feature-block__image">
            <div className="img-placeholder img-placeholder--tall">
              <img
                src="/images/craftifyle.png"
                alt="Craftifyle"
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', borderRadius: 'var(--rl)' }}
                onClick={() => openLightbox(['/images/craftifyle.png'], 0)}
              />
            </div>
          </div>
          <div className="feature-block__text">
            <span className="label-tag">Featured · Founder</span>
            <h3 className="feature-block__title">Craftifyle</h3>
            <p className="feature-block__desc">
              Craftifyle is my First Business, an Event photography, videography, and photobooth based in Zamboanga City. Started in November 2024 with 55,000PHP in scholarship money and zero experience. Now 18 months in, 50+ Events Covered, and still building. This is where it all started.
            </p>
            <a href="https://www.facebook.com/craftifylePH" className="btn btn--accent" target="_blank" rel="noopener noreferrer">
              Visit Craftifyle →
            </a>
          </div>
        </div>

        {/* Project grid */}
        <div className="work-grid">
          {(filter === 'all' || filter === 'photography') && photoCards.map((c, i) => (
            <article className="card" key={c.title} data-category="photography">
              <div className="client-card__img">
                <img
                  src={c.img}
                  alt={c.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                  onClick={() => openLightbox(allPhotoImgs, i)}
                />
              </div>
              <div className="card__body">
                <span className="label-tag label-tag--sm">{c.tag}</span>
                <h3 className="card__title">{c.title}</h3>
                <p className="card__desc">
                  <span className="case-label">Challenge</span> {c.challenge}<br />
                  <span className="case-label">Result</span> {c.result}
                </p>
                <a href="#" className="card__link">View project →</a>
              </div>
            </article>
          ))}

          {(filter === 'all' || filter === 'web') && webCards.map(c => (
            <article className="card card--web" key={c.title} data-category="web">
              <div className="card__browser-bar">
                <span className="card__browser-dot" />
                <span className="card__browser-dot" />
                <span className="card__browser-dot" />
                <div className="card__browser-url">{c.url}</div>
              </div>
              <div className="client-card__img">
                <img src={c.img} alt={c.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="card__body">
                <span className="label-tag label-tag--sm">{c.tag}</span>
                <h3 className="card__title">{c.title}</h3>
                <p className="card__desc">
                  <span className="case-label">What it is</span> {c.what}<br />
                  <span className="case-label">Tools used</span> {c.tools}
                </p>
                <a href={c.url} className="card__link" target="_blank" rel="noopener noreferrer">View site →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    {lbOpen && (
      <Lightbox
        images={lbImages}
        index={lbIndex}
        onClose={() => setLbOpen(false)}
        onPrev={() => setLbIndex(i => Math.max(0, i - 1))}
        onNext={() => setLbIndex(i => Math.min(lbImages.length - 1, i + 1))}
      />
    )}
    </>
  )
}
