'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import MessengerFloat from '@/components/MessengerFloat'

const GCAL_API_KEY     = 'AIzaSyBXSHn11u1ZYYkm1k7RgnRtPUfD0c70SXw'
const GCAL_CALENDAR_ID = 'craftifylephotobooth@gmail.com'
const FORMSPREE_ID     = 'maqkqlag'
const DEPOSIT_AMOUNT   = 500

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const SERVICES = [
  { value: 'Photobooth Service', icon: '📷', sub: 'Parties, weddings, corporate events', basePrice: 3500, hasHours: true  },
  { value: 'Event Photography',  icon: '🎉', sub: 'Full coverage of your special event',  basePrice: 4500, hasHours: true  },
  { value: 'Content Creation',   icon: '🎬', sub: 'Photos & videos for your brand',       basePrice: 3000, hasHours: false },
  { value: 'Brand Consultation', icon: '💡', sub: 'Strategy, identity & positioning',     basePrice: 1000, hasHours: false },
  { value: 'Web Design',         icon: '💻', sub: 'Portfolio, landing page, business site', basePrice: 8000, hasHours: false },
]

const DURATIONS = [
  { label: '3 hrs', extra: 0    },
  { label: '4 hrs', extra: 800  },
  { label: '5 hrs', extra: 1600 },
  { label: '6+ hrs', custom: true },
]

const bg    = '#17120e'
const bg2   = '#1e1710'
const card  = '#251c13'
const border= '#2e2318'
const text  = '#ede5d8'
const muted = '#9a8b7a'
const accent= '#c47a3a'

function pad(n: number) { return String(n).padStart(2, '0') }
function genRef() { return Math.random().toString(36).slice(2,8).toUpperCase() }

function ProgressBar({ step }: { step: number }) {
  const steps = ['Date', 'Service', 'Contact']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '20px 24px', borderBottom: `1px solid ${border}`, background: bg2 }}>
      {steps.map((label, i) => {
        const idx = i + 1
        const done   = step > idx
        const active = step === idx
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '.8rem', transition: 'all .2s',
                background: done ? accent : active ? accent : 'transparent',
                border: `2px solid ${done || active ? accent : border}`,
                color: done || active ? '#1a1208' : muted,
              }}>
                {done ? '✓' : idx}
              </div>
              <span style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: active ? accent : done ? accent : muted }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 2, background: step > idx ? accent : border, margin: '0 8px', marginBottom: '22px', transition: 'background .3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function BookingPage() {
  const searchParams = useSearchParams()
  const urlDate    = searchParams.get('date') || ''
  const urlService = searchParams.get('service') || ''

  const today = new Date(); today.setHours(0,0,0,0)
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`

  const [step, setStep]           = useState(urlDate ? 2 : 1)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setDate]   = useState(urlDate)
  const [bookedDates, setBooked]  = useState(new Set<string>())
  const fetched = useRef(new Set<string>())

  const [services,  setServices]  = useState<string[]>(urlService ? [urlService] : [])
  const [durIdx,    setDurIdx]    = useState(0)

  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [eventName, setEventName] = useState('')
  const [location,  setLocation]  = useState('')
  const [details,   setDetails]   = useState('')
  const [showExtra, setShowExtra] = useState(false)

  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingRef, setBookingRef] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  const fetchBooked = useCallback(async (year: number, month: number) => {
    const key = `${year}-${month}`
    if (fetched.current.has(key)) return
    fetched.current.add(key)
    try {
      const calId  = encodeURIComponent(GCAL_CALENDAR_ID)
      const tMin   = new Date(year, month, 1).toISOString()
      const tMax   = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const url    = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${GCAL_API_KEY}&timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime`
      const res    = await fetch(url)
      if (!res.ok) return
      const data   = await res.json()
      const dates: string[] = []
      ;(data.items || []).forEach((ev: { start: { date?: string; dateTime?: string }; end: { date?: string; dateTime?: string } }) => {
        const s = ev.start.date || (ev.start.dateTime || '').split('T')[0]
        const e = ev.end.date   || (ev.end.dateTime   || '').split('T')[0]
        if (!s) return
        let cur = new Date(s + 'T00:00:00')
        const stop = new Date((e || s) + 'T00:00:00')
        while (cur < stop) {
          dates.push(`${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`)
          cur.setDate(cur.getDate() + 1)
        }
      })
      if (dates.length) setBooked(prev => { const n = new Set(prev); dates.forEach(d => n.add(d)); return n })
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchBooked(viewYear, viewMonth) }, [viewYear, viewMonth, fetchBooked])

  const firstWeekday  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate()
  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth()

  const showDuration = services.some(sv => SERVICES.find(o => o.value === sv)?.hasHours)
  const dur = DURATIONS[durIdx]
  const estimate = dur.custom ? null : services.reduce((sum, sv) => {
    const o = SERVICES.find(s => s.value === sv)
    return sum + (o ? o.basePrice + (o.hasHours ? (dur.extra ?? 0) : 0) : 0)
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) { setError('Please fill in your name and phone number.'); return }
    setError('')
    setSubmitting(true)
    const ref = genRef()
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, phone, _replyto: '',
          services: services.join(', '),
          duration: dur.custom ? '6+ hrs (custom quote)' : dur.label,
          price_estimate: estimate ? `₱${estimate.toLocaleString()} starting` : 'Custom quote needed',
          date: selectedDate, event_name: eventName, location, details,
          booking_ref: ref,
          _subject: `Booking [${ref}] from ${name} — ${services.join(', ')} on ${selectedDate}`,
        }),
      })
      if (res.ok) { setBookingRef(ref); setStep(4) }
      else setError('Something went wrong. Please try again.')
    } catch { setError('Could not send. Check your connection.') }
    setSubmitting(false)
  }

  async function handlePayDeposit() {
    setPayLoading(true)
    try {
      const res = await fetch('/api/xendit/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef,
          serviceLabel: services.join(' + '),
          depositAmount: DEPOSIT_AMOUNT,
          name,
          phone,
        }),
      })
      const data = await res.json()
      if (data.invoiceUrl) window.location.href = data.invoiceUrl
      else alert('Could not open payment. Please message me on Messenger.')
    } catch { alert('Network error. Please message me on Messenger.') }
    setPayLoading(false)
  }

  /* ── Step 1: Calendar ── */
  if (step === 1) return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `rgba(23,18,14,.95)`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text, textDecoration: 'none' }}>James Ignacio</Link>
          <Link href="/" style={{ fontSize: '.78rem', color: muted, textDecoration: 'none' }}>← Back</Link>
        </div>
        <ProgressBar step={1} />
      </header>

      <main style={{ minHeight: '100vh', background: bg, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Step 1 of 3</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-.03em', color: text, marginBottom: '8px' }}>Pick a date.</h1>
          <p style={{ fontSize: '.88rem', color: muted, marginBottom: '36px' }}>Choose an available date for your session. Amber dates are already booked.</p>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button onClick={() => { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11) } else setViewMonth(m=>m-1) }}
              disabled={isPrevDisabled}
              style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${border}`, background: card, color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isPrevDisabled ? .3 : 1, fontSize: '1rem' }}>←</button>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: text }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={() => { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0) } else setViewMonth(m=>m+1) }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${border}`, background: card, color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>→</button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '6px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '.62rem', fontWeight: 700, color: muted, padding: '4px 0', letterSpacing: '.06em' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '28px' }}>
            {Array.from({ length: firstWeekday }).map((_,i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_,idx) => {
              const d       = idx + 1
              const dateStr = `${viewYear}-${pad(viewMonth+1)}-${pad(d)}`
              const fmt     = `${MONTHS[viewMonth]} ${d}, ${viewYear}`
              const isPast  = dateStr < todayStr
              const isToday = dateStr === todayStr
              const isBooked= bookedDates.has(dateStr)
              const isSel   = fmt === selectedDate

              let bgC = card, bdrC = border, colC = text, cur: string = 'pointer', op = 1
              if (isPast)    { op = .25; cur = 'default' }
              else if (isBooked) { bgC = 'rgba(196,122,58,.1)'; bdrC = 'rgba(196,122,58,.3)'; colC = accent; cur = 'not-allowed' }
              else if (isSel)    { bgC = accent; bdrC = accent; colC = '#1a1208' }
              else if (isToday)  { bdrC = accent }

              return (
                <div key={d} onClick={() => !isPast && !isBooked && setDate(fmt)}
                  style={{ aspectRatio: '1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.88rem', fontWeight: isSel ? 800 : 500, border: `1.5px solid ${bdrC}`, background: bgC, color: colC, cursor: cur, opacity: op, transition: 'all .12s' }}>
                  {d}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '36px' }}>
            {[{label:'Available',bg:card,bdr:border},{label:'Booked',bg:'rgba(196,122,58,.1)',bdr:'rgba(196,122,58,.3)'},{label:'Selected',bg:accent,bdr:accent}].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.7rem', color: muted }}>
                <span style={{ width: 12, height: 12, borderRadius: '3px', background: l.bg, border: `1px solid ${l.bdr}`, flexShrink: 0 }} />{l.label}
              </span>
            ))}
          </div>

          <button onClick={() => setStep(2)} disabled={!selectedDate}
            style={{ width: '100%', padding: '16px', borderRadius: '999px', background: selectedDate ? accent : border, color: selectedDate ? '#1a1208' : muted, fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: selectedDate ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s' }}>
            {selectedDate ? `Continue with ${selectedDate} →` : 'Select a date to continue'}
          </button>
        </div>
      </main>
      <MessengerFloat />
    </>
  )

  /* ── Step 2: Service ── */
  if (step === 2) return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `rgba(23,18,14,.95)`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text, textDecoration: 'none' }}>James Ignacio</Link>
          <Link href="/" style={{ fontSize: '.78rem', color: muted, textDecoration: 'none' }}>← Back</Link>
        </div>
        <ProgressBar step={2} />
      </header>

      <main style={{ minHeight: '100vh', background: bg, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Date summary pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', background: 'rgba(196,122,58,.1)', border: `1px solid rgba(196,122,58,.25)`, marginBottom: '28px' }}>
            <span style={{ fontSize: '.85rem' }}>📅</span>
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: accent }}>{selectedDate}</span>
          </div>

          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Step 2 of 3</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-.03em', color: text, marginBottom: '8px' }}>What do you need?</h1>
          <p style={{ fontSize: '.88rem', color: muted, marginBottom: '28px' }}>Pick one or more services. You can select multiple.</p>

          {/* Service cards */}
          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: '10px' }}>Craftifyle — Zamboanga City</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {SERVICES.slice(0, 2).map(o => {
              const checked = services.includes(o.value)
              return (
                <button key={o.value} type="button" onClick={() => setServices(prev => prev.includes(o.value) ? prev.filter(s => s !== o.value) : [...prev, o.value])}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: `1.5px solid ${checked ? accent : border}`, borderRadius: '12px', background: checked ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '5px', border: `2px solid ${checked ? accent : muted}`, background: checked ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                    {checked && <span style={{ color: '#1a1208', fontSize: '.7rem', fontWeight: 900 }}>✓</span>}
                  </span>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{o.icon}</span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: text }}>{o.value}</strong>
                    <small style={{ fontSize: '.75rem', color: muted }}>{o.sub}</small>
                  </span>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
                    ₱{o.basePrice.toLocaleString()}{o.hasHours ? '/3hrs' : ' flat'}
                  </span>
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: muted, marginBottom: '10px' }}>By James Ignacio — Freelance</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {SERVICES.slice(2).map(o => {
              const checked = services.includes(o.value)
              return (
                <button key={o.value} type="button" onClick={() => setServices(prev => prev.includes(o.value) ? prev.filter(s => s !== o.value) : [...prev, o.value])}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: `1.5px solid ${checked ? accent : border}`, borderRadius: '12px', background: checked ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '5px', border: `2px solid ${checked ? accent : muted}`, background: checked ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                    {checked && <span style={{ color: '#1a1208', fontSize: '.7rem', fontWeight: 900 }}>✓</span>}
                  </span>
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{o.icon}</span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '.9rem', fontWeight: 700, color: text }}>{o.value}</strong>
                    <small style={{ fontSize: '.75rem', color: muted }}>{o.sub}</small>
                  </span>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
                    ₱{o.basePrice.toLocaleString()}{o.hasHours ? '/3hrs' : ' flat'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Duration */}
          {showDuration && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>How long do you need?</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DURATIONS.map((d, i) => (
                  <button key={d.label} type="button" onClick={() => setDurIdx(i)}
                    style={{ padding: '9px 22px', borderRadius: '999px', border: `1.5px solid ${durIdx === i ? accent : border}`, background: durIdx === i ? 'rgba(196,122,58,.12)' : card, color: durIdx === i ? accent : muted, fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price estimate */}
          {services.length > 0 && (
            <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(196,122,58,.07)', border: `1px solid rgba(196,122,58,.2)`, marginBottom: '32px' }}>
              <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: muted, marginBottom: '4px' }}>Estimated starting price</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: accent, letterSpacing: '-.02em' }}>
                {dur.custom ? 'Custom quote' : `₱${estimate?.toLocaleString()}`}
              </p>
              <p style={{ fontSize: '.74rem', color: muted, marginTop: '4px' }}>{services.join(' + ')} · Final rate confirmed after consult</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setStep(1)}
              style={{ padding: '14px 28px', borderRadius: '999px', border: `1.5px solid ${border}`, background: 'transparent', color: muted, fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back
            </button>
            <button onClick={() => { setError(''); setStep(3) }} disabled={services.length === 0}
              style={{ flex: 1, padding: '14px', borderRadius: '999px', background: services.length > 0 ? accent : border, color: services.length > 0 ? '#1a1208' : muted, fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: services.length > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s' }}>
              {services.length > 0 ? 'Continue →' : 'Pick at least one service'}
            </button>
          </div>
        </div>
      </main>
      <MessengerFloat />
    </>
  )

  /* ── Step 4: Success ── */
  if (step === 4) return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `rgba(23,18,14,.95)`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text, textDecoration: 'none' }}>James Ignacio</Link>
        </div>
      </header>
      <main style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: accent, color: '#1a1208', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>✓</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 800, color: text, letterSpacing: '-.02em', marginBottom: '12px' }}>
            Request sent, {name.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '.9rem', color: muted, lineHeight: 1.75, marginBottom: '8px' }}>
            I&rsquo;ll review your booking and get back to you within 24 hours.
          </p>
          <p style={{ fontSize: '.78rem', color: muted, marginBottom: '32px' }}>
            Reference: <strong style={{ color: accent, fontFamily: 'monospace' }}>{bookingRef}</strong>
          </p>

          {/* Deposit CTA */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ fontSize: '.9rem', fontWeight: 700, color: text, marginBottom: '6px' }}>
              💸 Hold your slot with a ₱{DEPOSIT_AMOUNT.toLocaleString()} deposit
            </p>
            <p style={{ fontSize: '.8rem', color: muted, lineHeight: 1.65, marginBottom: '20px' }}>
              Paying now guarantees your date. Skip this and I&rsquo;ll still review — but the slot isn&rsquo;t locked until deposit is received.
            </p>
            <button onClick={handlePayDeposit} disabled={payLoading}
              style={{ width: '100%', padding: '14px', borderRadius: '999px', background: payLoading ? border : accent, color: payLoading ? muted : '#1a1208', fontWeight: 800, fontSize: '.9rem', border: 'none', cursor: payLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
              {payLoading ? 'Opening payment…' : `Pay ₱${DEPOSIT_AMOUNT.toLocaleString()} via GCash →`}
            </button>
          </div>

          <a href="https://m.me/craftifylephotobooth" target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: '13px', borderRadius: '999px', border: `1.5px solid ${border}`, color: muted, fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', marginBottom: '24px', transition: 'border-color .15s' }}>
            💬 Or message me directly instead
          </a>

          <Link href="/" style={{ fontSize: '.78rem', color: muted }}>← Back to site</Link>
        </div>
      </main>
      <MessengerFloat />
    </>
  )

  /* ── Step 3: Contact ── */
  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `rgba(23,18,14,.95)`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text, textDecoration: 'none' }}>James Ignacio</Link>
          <Link href="/" style={{ fontSize: '.78rem', color: muted, textDecoration: 'none' }}>← Back</Link>
        </div>
        <ProgressBar step={3} />
      </header>

      <main style={{ minHeight: '100vh', background: bg, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Summary pill */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {[`📅 ${selectedDate}`, `${services.join(' + ')}`, estimate ? `₱${estimate.toLocaleString()}` : 'Custom quote'].map(pill => (
              <span key={pill} style={{ padding: '6px 14px', borderRadius: '999px', background: 'rgba(196,122,58,.1)', border: `1px solid rgba(196,122,58,.25)`, fontSize: '.75rem', fontWeight: 600, color: accent }}>{pill}</span>
            ))}
          </div>

          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Step 3 of 3</p>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-.03em', color: text, marginBottom: '8px' }}>Almost done.</h1>
          <p style={{ fontSize: '.88rem', color: muted, marginBottom: '32px' }}>Just your name and number — I&rsquo;ll handle the rest.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {[
                { id: 'b-name',  label: 'Full name',    ph: 'Juan dela Cruz',   val: name,  set: setName,  type: 'text', req: true },
                { id: 'b-phone', label: 'Phone number', ph: '+63 9xx xxx xxxx', val: phone, set: setPhone, type: 'tel',  req: true },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>
                    {f.label} <span style={{ color: '#e07070' }}>*</span>
                  </label>
                  <input id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required={f.req}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => (e.target.style.borderColor = accent)}
                    onBlur={e  => (e.target.style.borderColor = border)}
                  />
                </div>
              ))}
            </div>

            {/* Optional extra fields */}
            <button type="button" onClick={() => setShowExtra(v => !v)}
              style={{ background: 'none', border: 'none', color: muted, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {showExtra ? '▾' : '▸'} Add event details (optional)
            </button>

            {showExtra && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {[
                  { id: 'b-event', label: 'Event or project name', ph: 'e.g. Grad party, brand shoot', val: eventName, set: setEventName, type: 'text' },
                  { id: 'b-loc',   label: 'Location',              ph: 'Where will this take place?', val: location,  set: setLocation,  type: 'text' },
                ].map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>{f.label}</label>
                    <input id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                      onFocus={e => (e.target.style.borderColor = accent)}
                      onBlur={e  => (e.target.style.borderColor = border)}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="b-details" style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>Additional notes</label>
                  <textarea id="b-details" rows={3} value={details} onChange={e => setDetails(e.target.value)} placeholder="Guest count, specific requests, budget range…"
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => (e.target.style.borderColor = accent)}
                    onBlur={e  => (e.target.style.borderColor = border)}
                  />
                </div>
              </div>
            )}

            {error && (
              <p style={{ fontSize: '.82rem', color: '#f87171', marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setStep(2)}
                style={{ padding: '14px 28px', borderRadius: '999px', border: `1.5px solid ${border}`, background: 'transparent', color: muted, fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Back
              </button>
              <button type="submit" disabled={submitting}
                style={{ flex: 1, padding: '14px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .6 : 1, fontFamily: 'inherit', transition: 'opacity .2s' }}>
                {submitting ? 'Sending…' : 'Send Booking Request →'}
              </button>
            </div>

            <p style={{ fontSize: '.75rem', color: muted, textAlign: 'center', lineHeight: 1.6 }}>
              50+ events covered · I reply within 24 hours · No payment required now
            </p>
          </form>
        </div>
      </main>
      <MessengerFloat />
    </>
  )
}

export default function BookingPageWrapper() {
  return <Suspense><BookingPage /></Suspense>
}
