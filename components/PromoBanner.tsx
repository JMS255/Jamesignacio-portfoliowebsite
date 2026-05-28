'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const BANNER_KEY = 'craftifyle_june_banner_dismissed'

export default function PromoBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(BANNER_KEY)) {
      document.body.classList.add('banner-dismissed')
    } else {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem(BANNER_KEY, '1')
    document.body.classList.add('banner-dismissed')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="promo-banner">
      <div className="promo-banner__inner">
        <span className="promo-banner__dot" aria-hidden="true" />
        <p className="promo-banner__text">
          <span className="promo-banner__long">
            <strong>June only:</strong> Book online and save{' '}
            <strong>₱500 off</strong> our Photobooth&nbsp;+ Photography Bundle.{' '}
            <span className="promo-banner__slots">Only 5 slots left.</span>
          </span>
          <span className="promo-banner__short">
            <strong>₱500 off</strong> Bundle — June only.{' '}
            <span className="promo-banner__slots">5 slots left.</span>
          </span>
        </p>
        <Link
          href="/booking?service=Photobooth+%2B+Photography+Bundle&promo=june500"
          className="promo-banner__cta"
        >
          Claim now →
        </Link>
      </div>
      <button className="promo-banner__close" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
