'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import MessengerFloat from '@/components/MessengerFloat'

const FORMSPREE_ID = 'maqkqlag'

const bg    = '#17120e'
const bg2   = '#1e1710'
const card  = '#251c13'
const border= '#2e2318'
const text  = '#ede5d8'
const muted = '#9a8b7a'
const accent= '#c47a3a'

const SERVICES = [
  { id: 'Content Creation',   icon: '🎬', label: 'Content Creation',   sub: 'Photos & videos for social media or your brand' },
  { id: 'Brand Consultation', icon: '💡', label: 'Brand Consultation',  sub: 'Strategy, identity & positioning' },
  { id: 'Web Design',         icon: '💻', label: 'Web Design',          sub: 'Portfolio, landing page, or business site' },
]

const BUDGETS = ['₱1,000–5,000', '₱5,000–15,000', '₱15,000+', "Let's discuss"]

function InquiryForm() {
  const searchParams = useSearchParams()
  const urlService   = searchParams.get('service') || ''

  const [service,     setService]     = useState(urlService)
  const [description, setDescription] = useState('')
  const [budget,      setBudget]      = useState('')
  const [name,        setName]        = useState('')
  const [phone,       setPhone]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [sent,        setSent]        = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service)            { setError('Please select a service.'); return }
    if (!description.trim()) { setError('Please describe your project.'); return }
    if (!name.trim() || !phone.trim()) { setError('Please fill in your name and phone.'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, phone,
          service,
          project_description: description,
          budget: budget || 'Not specified',
          _subject: `Project inquiry from ${name} — ${service}`,
        }),
      })
      if (res.ok) setSent(true)
      else setError('Something went wrong. Please try again.')
    } catch { setError('Could not send. Check your connection.') }
    setSubmitting(false)
  }

  if (sent) return (
    <main style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: accent, color: '#1a1208', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>✓</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: text, letterSpacing: '-.02em', marginBottom: '12px' }}>Got it, {name.split(' ')[0]}!</h1>
        <p style={{ fontSize: '.9rem', color: muted, lineHeight: 1.7, marginBottom: '32px' }}>
          I&rsquo;ll review your project brief and get back to you within 24 hours.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://m.me/craftifylephotobooth" target="_blank" rel="noopener noreferrer"
            style={{ padding: '13px 28px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 700, fontSize: '.88rem', textDecoration: 'none' }}>
            💬 Message me directly
          </a>
          <Link href="/" style={{ padding: '13px 28px', borderRadius: '999px', border: `1.5px solid ${border}`, color: muted, fontSize: '.88rem', textDecoration: 'none' }}>
            Back to site
          </Link>
        </div>
      </div>
    </main>
  )

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `rgba(23,18,14,.97)`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text, textDecoration: 'none' }}>James Ignacio</Link>
          <Link href="/" style={{ fontSize: '.78rem', color: muted, textDecoration: 'none' }}>← Back to site</Link>
        </div>
      </header>

      <main style={{ minHeight: '100vh', background: bg, padding: '48px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>By James Ignacio — Freelance</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-.03em', color: text, marginBottom: '8px' }}>Tell me about your project.</h1>
          <p style={{ fontSize: '.88rem', color: muted, marginBottom: '40px' }}>Fill this in and I&rsquo;ll get back to you within 24 hours with a plan.</p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Service */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>What do you need help with? *</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SERVICES.map(s => {
                  const sel = service === s.id
                  return (
                    <button key={s.id} type="button" onClick={() => setService(s.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 18px', borderRadius: '12px', border: `1.5px solid ${sel ? accent : border}`, background: sel ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</span>
                      <span style={{ flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '.95rem', fontWeight: 700, color: text }}>{s.label}</strong>
                        <small style={{ fontSize: '.75rem', color: muted }}>{s.sub}</small>
                      </span>
                      {sel && <span style={{ color: accent, fontWeight: 800, fontSize: '1rem' }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="desc" style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>
                Tell me about your project *
              </label>
              <textarea id="desc" rows={4} value={description} onChange={e => setDescription(e.target.value)} required
                placeholder="What do you need? Who's your audience? Any reference or examples you like?"
                style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                onFocus={e => (e.target.style.borderColor = accent)}
                onBlur={e  => (e.target.style.borderColor = border)}
              />
            </div>

            {/* Budget */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>Budget range</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {BUDGETS.map(b => (
                  <button key={b} type="button" onClick={() => setBudget(b)}
                    style={{ padding: '9px 18px', borderRadius: '999px', border: `1.5px solid ${budget === b ? accent : border}`, background: budget === b ? 'rgba(196,122,58,.12)' : card, color: budget === b ? accent : muted, fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {[
                { id: 'i-name',  label: 'Your name',    ph: 'Juan dela Cruz',   val: name,  set: setName,  type: 'text' },
                { id: 'i-phone', label: 'Phone number', ph: '+63 9xx xxx xxxx', val: phone, set: setPhone, type: 'tel'  },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>
                    {f.label} <span style={{ color: '#e07070' }}>*</span>
                  </label>
                  <input id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => (e.target.style.borderColor = accent)}
                    onBlur={e  => (e.target.style.borderColor = border)}
                  />
                </div>
              ))}
            </div>

            {error && <p style={{ fontSize: '.82rem', color: '#f87171', marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)' }}>{error}</p>}

            <button type="submit" disabled={submitting}
              style={{ width: '100%', padding: '16px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .6 : 1, fontFamily: 'inherit', transition: 'opacity .2s' }}>
              {submitting ? 'Sending…' : 'Send Project Brief →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '.75rem', color: muted, marginTop: '10px' }}>I&rsquo;ll reply within 24 hours · No payment required now</p>
          </form>
        </div>
      </main>
      <MessengerFloat />
    </>
  )
}

export default function InquiryPage() {
  return <Suspense><InquiryForm /></Suspense>
}
