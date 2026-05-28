'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const links = [
  { href: '#work',    label: 'Work' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#blog',    label: 'Writing' },
  { href: '#about',   label: 'About' },
]

export default function Nav() {
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
      <Link href="/" className="nav__logo">James Ignacio</Link>
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
      <Link href="/booking" className="btn btn--accent nav__cta">Hire Me →</Link>
    </header>
  )
}
