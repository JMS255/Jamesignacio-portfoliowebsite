'use client'

import { useState } from 'react'

const NEWSLETTER_FORMSPREE_ID = 'xlgvgozr'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`https://formspree.io/f/${NEWSLETTER_FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, _subject: 'New newsletter subscriber' }),
      })
      if (res.ok) {
        setSuccess(true)
        setEmail('')
      } else {
        setError('Something went wrong. Try again.')
      }
    } catch {
      setError('Could not subscribe. Check your connection.')
    }
    setLoading(false)
  }

  return (
    <section className="newsletter section section--alt" id="newsletter">
      <div className="container newsletter__inner">
        <p className="section__label">Newsletter</p>
        <h2 className="newsletter__title">
          Weekly tips on growing<br />
          <em>your business with content.</em>
        </h2>
        <p className="newsletter__sub">Subscribe and I&rsquo;ll also send you all my playbooks — free. No spam, ever.</p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="newsletter-form__row">
            <input
              type="email"
              className="newsletter-form__input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn--consult" disabled={loading}>
              {loading ? 'Subscribing…' : 'Subscribe →'}
            </button>
          </div>
          {error && <p className="form-error" style={{ marginTop: '10px' }}>{error}</p>}
          {success && <p className="newsletter-success">You&rsquo;re in. Check your inbox soon.</p>}
        </form>
      </div>
    </section>
  )
}
