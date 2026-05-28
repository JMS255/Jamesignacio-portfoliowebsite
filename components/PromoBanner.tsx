'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const BANNER_KEY = 'craftifyle_june_banner_dismissed'
const HREF = '/booking?service=Photobooth+%2B+Photography+Bundle&promo=june500'

export default function PromoBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(BANNER_KEY)) {
      document.body.classList.add('banner-dismissed')
    } else {
      setVisible(true)
    }
  }, [])

  function dismiss(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    sessionStorage.setItem(BANNER_KEY, '1')
    document.body.classList.add('banner-dismissed')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <Link href={HREF} className="promo-banner">
      <div className="promo-banner__inner">
        <span className="promo-banner__dot" aria-hidden="true" />
        {/* Desktop */}
        <span className="promo-banner__long">
          <strong>June only:</strong> Book online &amp; save <strong>₱500 off</strong> our Bundle.{' '}
          <span className="promo-banner__slots">Only 5 slots left.</span>
          <span className="promo-banner__pill">Claim now →</span>
        </span>
        {/* Mobile */}
        <span className="promo-banner__short">
          <strong>₱500 off</strong> Bundle — <span className="promo-banner__slots">5 slots left</span> · Tap to claim →
        </span>
      </div>
      <button className="promo-banner__close" onClick={dismiss} aria-label="Dismiss">✕</button>
    </Link>
  )
}
