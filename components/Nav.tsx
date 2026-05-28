'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const links = [
  { href: '#services', label: 'Services' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/booking', label: 'Book' },
  { href: '#work', label: 'Work' },
  { href: '/gallery', label: 'Gallery' },
  { href: '#blog', label: 'Writing' },
  { href: '#playbooks', label: 'Playbooks' },
  { href: '#about', label: 'About' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav({ onOpenModal }: { onOpenModal: () => void }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive('#' + e.target.id)
        })
      },
      { threshold: 0.4 }
    )
    sections.forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  function close() { setOpen(false) }

  return (
    <header className="nav" id="nav">
      <a href="#home" className="nav__logo">James Ignacio</a>
      <button
        className={`nav__toggle${open ? ' is-open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span /><span /><span />
      </button>
      <nav className={`nav__links${open ? ' is-open' : ''}`} id="nav-links">
        {links.map(l => (
          l.href.startsWith('#') ? (
            <a
              key={l.href}
              href={l.href}
              className={active === l.href ? 'active' : ''}
              onClick={close}
            >
              {l.label}
            </a>
          ) : (
            <Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>
          )
        ))}
      </nav>
      <button className="btn btn--consult nav__cta" onClick={onOpenModal}>
        Book a Consult
      </button>
    </header>
  )
}
