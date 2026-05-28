'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

const clients = [
  { img: '/images/3pics-kenny.jpg', alt: 'Kenny Rogers Roasters', tag: 'Commercial Photography', name: 'Kenny Rogers Roasters', context: 'SM City Zamboanga — Grand Opening', result: 'Interior & exterior shots. Delivered within 48 hours.' },
  { img: '/images/Mahad-school2.jpg', alt: 'Mahad school', tag: 'Event Documentation', name: "Mahad Al-Qur'an Wal Hadith", context: 'Recognition Day & Graduation', result: '400+ edited photos + hard copies. Delivered within 48 hours.' },
  { img: '/images/moving-up.jpg', alt: 'South East Learning Center graduation', tag: 'Event Documentation', name: 'South East Learning Center', context: 'Graduation Day', result: '250+ edited photos. Delivered within 48 hours.' },
  { img: '/images/hugging-idk.jpg', alt: 'Baginda & Salbayani wedding', tag: 'Wedding Photography', name: 'Baginda & Salbayani', context: 'Wedding Celebration', result: '300+ edited photos. Delivered within 48 hours.' },
  { img: '/images/kid-idk.jpg', alt: 'Graduation celebration', tag: 'Event Photography', name: 'Nourhaifa S. Jailani', context: 'Graduation Celebration', result: '250+ edited photos. Delivered within 24 hours.' },
  { img: '/images/60th-bday.jpg', alt: '60th birthday', tag: 'Photobooth + Photography', name: 'Vilma Colado', context: '60th Birthday Celebration', result: '150 edited photos. Delivered within 24 hours.' },
  { img: '/images/3women-smiling.jpg', alt: '70th birthday', tag: 'Photobooth Rental', name: 'Florita', context: '70th Birthday Celebration', result: 'Professional setup, early arrival, and full entertainment coverage.' },
  { img: '/images/2024.jpg', alt: 'Ateneo Fiesta 2024', tag: 'Photobooth Concessionaire', name: 'Ateneo Fiesta 2024', context: 'ADZU Atfest 2024 — 3 Days', result: '2,400 photos shot. 967 photobooth strips & 4R prints.' },
  { img: '/images/2025.jpg', alt: 'Ateneo Fiesta 2025', tag: 'Photobooth Concessionaire', name: 'Ateneo Fiesta 2025', context: 'ADZU Atfest 2025 — 7 Days', result: '4,671 photos shot. 1,862 photobooth strips & 4R prints.' },
  { img: '/images/pictorial.jpg', alt: 'Graduation pictorial', tag: 'Graduation Pictorial', name: 'Camino Nuevo Day Care Center', context: 'Class of 2026', result: 'Individual graduation portraits with printed copies. Delivered within 4 days.' },
]

function getVisible() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth > 860) return 3
  if (window.innerWidth > 560) return 2
  return 1
}

export default function Clients() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [visible, setVisible] = useState(3)
  const total = Math.ceil(clients.length / visible)

  useEffect(() => {
    setVisible(getVisible())
    const onResize = () => {
      setVisible(getVisible())
      setPage(0)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goTo = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(p, Math.ceil(clients.length / visible) - 1))
    setPage(clamped)
    const track = trackRef.current
    if (!track) return
    const cards = track.querySelectorAll('.client-card')
    const target = cards[clamped * visible] as HTMLElement
    if (target) track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }, [visible])

  const totalPages = Math.ceil(clients.length / visible)

  return (
    <section className="clients section" id="clients">
      <div className="container">
        <p className="section__label">Previous Clients</p>
        <h2 className="section__title">Businesses &amp; families that trusted Craftifyle.</h2>
        <div className="clients-carousel">
          <div className="clients-track" ref={trackRef}>
            {clients.map(c => (
              <div className="client-card" key={c.name}>
                <div className="client-card__img">
                  <img src={c.img} alt={c.alt} />
                </div>
                <div className="client-card__body">
                  <span className="label-tag label-tag--sm">{c.tag}</span>
                  <h3 className="client-card__name">{c.name}</h3>
                  <p className="client-card__context">{c.context}</p>
                  <p className="client-card__result">{c.result}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="clients-controls">
            <button className="clients-btn" onClick={() => goTo(page - 1)} disabled={page === 0} aria-label="Previous">←</button>
            <div className="clients-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`clients-dot${i === page ? ' clients-dot--active' : ''}`}
                  aria-label={`Go to page ${i + 1}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button className="clients-btn" onClick={() => goTo(page + 1)} disabled={page >= totalPages - 1} aria-label="Next">→</button>
          </div>
        </div>
      </div>
    </section>
  )
}
