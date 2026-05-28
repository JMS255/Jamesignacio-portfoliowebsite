'use client'

import React, { useState, useEffect } from 'react'

const FORMSPREE_ID = 'maqkqlag'

const SERVICE_OPTIONS = [
  { value: 'Photobooth Rental',   icon: '📷', label: 'Photobooth Rental',   sub: 'Parties, weddings, corporate events' },
  { value: 'Event Photography',   icon: '🎉', label: 'Event Photography',   sub: 'Full coverage of your special event' },
  { value: 'Content Creation',    icon: '🎬', label: 'Content Creation',    sub: 'Photos & videos for your brand' },
  { value: 'Brand Consultation',  icon: '💡', label: 'Brand Consultation',  sub: 'Strategy, identity & positioning' },
  { value: 'Web Design',          icon: '💻', label: 'Web Design',          sub: 'Portfolio, landing page, or business site' },
]

interface Props {
  preselect?: string
  predate?: string
  onClose: () => void
}

export default function ConsultModal({ preselect, predate, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string[]>(preselect ? [preselect] : [])
  const [step1Error, setStep1Error] = useState(false)

  const [eventName, setEventName]     = useState('')
  const [eventDate, setEventDate]     = useState(predate || '')
  const [eventDetails, setEventDetails] = useState('')

  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [step3Error, setStep3Error] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successName, setSuccessName] = useState('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function toggleService(val: string) {
    setSelected(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  }

  function step1Next() {
    if (selected.length === 0) { setStep1Error(true); return }
    setStep1Error(false)
    setStep(2)
  }

  async function submitLead() {
    if (!name.trim() || !email.trim()) { setStep3Error(true); return }
    setStep3Error(false)
    setSubmitting(true)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, email, phone,
          services: selected.join(', '),
          event_name: eventName,
          event_date: eventDate,
          details: eventDetails,
          _subject: `New consult inquiry from ${name} — ${selected.join(', ')}`,
        }),
      })
      if (res.ok) {
        setSuccessName(name.split(' ')[0])
        setStep(4)
      }
    } catch { /* silent */ }
    setSubmitting(false)
  }

  const stepNum = step < 4 ? step : 3

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <button className="modal__close" aria-label="Close" onClick={onClose}>&times;</button>

        {step < 4 && (
          <div className="modal__steps">
            {[1,2,3].map((n, i) => (
              <React.Fragment key={n}>
                <span className={`step${stepNum === n ? ' step--active' : ''}${stepNum > n ? ' step--done' : ''}`}>
                  {n}
                </span>
                {i < 2 && <span className="step__line" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="modal__title" id="modal-title">What do you need?</h2>
            <p className="modal__sub">Select everything that applies.</p>
            <div className="service-options">
              {SERVICE_OPTIONS.map(o => (
                <label className="service-option" key={o.value}>
                  <input
                    type="checkbox"
                    checked={selected.includes(o.value)}
                    onChange={() => toggleService(o.value)}
                  />
                  <span className="service-option__label">
                    <span className="service-option__icon">{o.icon}</span>
                    <span>
                      <strong>{o.label}</strong>
                      <small>{o.sub}</small>
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {step1Error && <p className="form-error">Please select at least one.</p>}
            <button className="btn btn--modal-primary btn--full" onClick={step1Next}>Continue →</button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 className="modal__title">Tell me about your project.</h2>
            <p className="modal__sub">Whatever you know so far is enough.</p>
            <div className="form-group">
              <label htmlFor="event-name">Event or project name</label>
              <input id="event-name" type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Graduation party, brand shoot" />
            </div>
            <div className="form-group">
              <label htmlFor="event-date">Date (if you have one)</label>
              <input id="event-date" type="text" value={eventDate} onChange={e => setEventDate(e.target.value)} placeholder="e.g. June 15, 2026" />
            </div>
            <div className="form-group">
              <label htmlFor="event-details">Anything else?</label>
              <textarea id="event-details" rows={3} value={eventDetails} onChange={e => setEventDetails(e.target.value)} placeholder="Location, guest count, budget, specific needs…" />
            </div>
            <div className="modal__nav">
              <button className="btn btn--modal-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn--modal-primary" onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 className="modal__title">How can I reach you?</h2>
            <p className="modal__sub">I&rsquo;ll get back to you within 24 hours.</p>
            <div className="form-group">
              <label htmlFor="contact-name">Your name <span className="required">*</span></label>
              <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Juan dela Cruz" />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email address <span className="required">*</span></label>
              <input id="contact-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" />
            </div>
            <div className="form-group">
              <label htmlFor="contact-phone">Phone number</label>
              <input id="contact-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+63 9xx xxx xxxx" />
            </div>
            {step3Error && <p className="form-error">Please enter your name and email.</p>}
            <div className="modal__nav">
              <button className="btn btn--modal-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn--modal-primary" onClick={submitLead} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send inquiry →'}
              </button>
            </div>
            <p className="form-note">* Required. Used only to follow up with you.</p>
          </div>
        )}

        {/* Step 4 — success */}
        {step === 4 && (
          <div className="modal__success">
            <span className="success-icon">✓</span>
            <h2 className="modal__title">Got it, {successName}!</h2>
            <p className="modal__sub">I&rsquo;ll review your inquiry and reach out within 24 hours. Looking forward to working with you.</p>
            <button className="btn btn--modal-primary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
