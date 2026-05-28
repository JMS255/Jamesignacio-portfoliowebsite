'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const SLOTS_LEFT = 5
const TOTAL_SLOTS = 10
const PROMO_KEY = 'craftifyle_june_promo_dismissed'

export default function PromoPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(PROMO_KEY)) return
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    sessionStorage.setItem(PROMO_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const filled = TOTAL_SLOTS - SLOTS_LEFT

  return (
    <div className="promo-popup" role="dialog" aria-modal="true" aria-label="June promo">
      <button className="promo-popup__close" onClick={dismiss} aria-label="Close">✕</button>

      <div className="promo-popup__badge">🎉 June Promo</div>

      <h3 className="promo-popup__title">
        Book online &amp; save <span className="promo-popup__highlight">₱500</span>
      </h3>

      <p className="promo-popup__body">
        Get <strong>₱500 off</strong> when you book our <strong>Photobooth&nbsp;+ Photography Bundle</strong> through this website.
        Valid on events booked <strong>June&nbsp;1–30, 2026</strong> only.
      </p>

      {/* Slot bar */}
      <div className="promo-popup__slots">
        <div className="promo-popup__slots-bar">
          <div
            className="promo-popup__slots-fill"
            style={{ width: `${(filled / TOTAL_SLOTS) * 100}%` }}
          />
        </div>
        <p className="promo-popup__slots-label">
          <strong>{SLOTS_LEFT} slots left</strong> out of {TOTAL_SLOTS} — June only
        </p>
      </div>

      <Link
        href="/booking?service=Photobooth+%2B+Photography+Bundle&promo=june500"
        className="btn btn--accent promo-popup__cta"
        onClick={dismiss}
      >
        Claim my slot →
      </Link>

      <button className="promo-popup__skip" onClick={dismiss}>
        No thanks, I&apos;ll pay full price
      </button>
    </div>
  )
}