'use client'

import { useState } from 'react'

export default function GalleryCallout() {
  const [input, setInput] = useState('')

  function go() {
    const slug = input.trim().toLowerCase().replace(/\s+/g, '-')
    if (slug) window.location.href = `/gallery?event=${slug}`
  }

  return (
    <section className="gallery-callout">
      <div className="gallery-callout__inner container">

        <div className="gallery-callout__text">
          <span className="gallery-callout__eyebrow">📸 For event guests</span>
          <h2 className="gallery-callout__title">Your photos are ready to download.</h2>
          <p className="gallery-callout__sub">
            We upload photos live during every Craftifyle event. Type your event name below and
            grab your photos straight to your phone — for free, no account needed.
          </p>
        </div>

        <div className="gallery-callout__search">
          <div className="gallery-callout__input-row">
            <input
              type="text"
              className="gallery-callout__input"
              placeholder="Type your event name…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
            />
            <button className="gallery-callout__btn" onClick={go}>
              Find My Photos →
            </button>
          </div>
          <p className="gallery-callout__hint">
            e.g. &ldquo;Maria Graduation 2026&rdquo; or &ldquo;Abi Grad Party&rdquo;
          </p>
        </div>

      </div>
    </section>
  )
}
