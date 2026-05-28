'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import MessengerFloat from '@/components/MessengerFloat'

const GCAL_API_KEY     = 'AIzaSyBXSHn11u1ZYYkm1k7RgnRtPUfD0c70SXw'
const GCAL_CALENDAR_ID = 'craftifylephotobooth@gmail.com'
const FORMSPREE_ID     = 'maqkqlag'
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const SERVICES = [
  { value: 'Photobooth Rental',  icon: '📷', sub: 'Parties, weddings, corporate events', basePrice: 3500, hasHours: true  },
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

function pad(n: number) { return String(n).padStart(2, '0') }

function BookingPage() {
  const searchParams = useSearchParams()
  const urlDate    = searchParams.get('date') || ''
  const urlService = searchParams.get('service') || ''

  const today = new Date(); today.setHours(0,0,0,0)
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`

  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(urlDate)
  const [bookedDates, setBookedDates]   = useState(new Set<string>())
  const fetched = useRef(new Set<string>())

  const [services,  setServices]  = useState<string[]>(urlService ? [urlService] : [])
  const [durIdx,    setDurIdx]    = useState(0)
  const [eventName, setEventName] = useState('')
  const [location,  setLocation]  = useState('')
  const [details,   setDetails]   = useState('')
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [error,     setError]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success,   setSuccess]   = useState(false)

  const formRef = useRef<HTMLDivElement>(null)

  const fetchBooked = useCallback(async (year: number, month: number) => {
    const key = `${year}-${month}`
    if (fetched.current.has(key)) return
    fetched.current.add(key)
    try {
      const calId = encodeURIComponent(GCAL_CALENDAR_ID)
      const timeMin = new Date(year, month, 1).toISOString()
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${GCAL_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('[Calendar] API error', res.status, err?.error?.message || res.statusText)
        return
      }
      const data = await res.json()
      console.log('[Calendar] Fetched', (data.items || []).length, 'events for', year, month + 1, data.items)
      const newDates: string[] = []
      ;(data.items || []).forEach((ev: { start: { date?: string; dateTime?: string }; end: { date?: string; dateTime?: string } }) => {
        const s = ev.start.date || (ev.start.dateTime || '').split('T')[0]
        const e = ev.end.date   || (ev.end.dateTime   || '').split('T')[0]
        if (!s) return
        let cur = new Date(s + 'T00:00:00')
        const stop = new Date((e || s) + 'T00:00:00')
        while (cur < stop) {
          newDates.push(`${cur.getFullYear()}-${pad(cur.getMonth()+1)}-${pad(cur.getDate())}`)
          cur.setDate(cur.getDate() + 1)
        }
      })
      if (newDates.length > 0) {
        setBookedDates(prev => {
          const next = new Set(prev)
          newDates.forEach(d => next.add(d))
          return next
        })
      }
    } catch { /* silent */ }
  }, []) // stable — functional update means no bookedDates dependency needed

  useEffect(() => { fetchBooked(viewYear, viewMonth) }, [viewYear, viewMonth, fetchBooked])

  function pickDate(formatted: string) {
    setSelectedDate(formatted)
    if (window.innerWidth < 900) setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function toggleService(val: string) {
    setServices(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate()
  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth()

  const showDuration = services.some(sv => SERVICES.find(o => o.value === sv)?.hasHours)
  const dur = DURATIONS[durIdx]
  const estimate = dur.custom ? null : services.reduce((sum, sv) => {
    const o = SERVICES.find(s => s.value === sv)
    return sum + (o ? o.basePrice + (o.hasHours ? (dur.extra ?? 0) : 0) : 0)
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (services.length === 0) { setError('Please select at least one service.'); return }
    if (!selectedDate)          { setError('Please select a date from the calendar.'); return }
    if (!name.trim() || !email.trim()) { setError('Please fill in your name and email.'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, email, phone, _replyto: email,
          services: services.join(', '),
          duration: dur.custom ? '6+ hrs (custom quote)' : dur.label,
          price_estimate: estimate ? `₱${estimate.toLocaleString()} starting` : 'Custom quote needed',
          date: selectedDate, event_name: eventName, location, details,
          _subject: `Booking request from ${name} — ${services.join(', ')} on ${selectedDate}`,
        }),
      })
      if (res.ok) setSuccess(true)
      else setError('Something went wrong. Please try again.')
    } catch { setError('Could not send. Check your connection.') }
    setSubmitting(false)
  }

  /* ── inline style tokens ── */
  const bg    = '#17120e'
  const bg2   = '#1e1710'
  const card  = '#251c13'
  const border= '#2e2318'
  const text  = '#ede5d8'
  const muted = '#9a8b7a'
  const accent= '#c47a3a'
  const navH  = '68px'

  return (
    <>
      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: navH, background: 'rgba(23,18,14,.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
        <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text }}>James Ignacio</Link>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 18px', borderRadius: '999px', border: `1px solid ${border}`, color: muted, fontSize: '.78rem', fontWeight: 600, background: 'transparent', transition: 'all .15s' }}>← Back to site</Link>
      </header>

      <main style={{ minHeight: `calc(100svh - ${navH})` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: `calc(100svh - ${navH})` }}>

          {/* ── LEFT: Calendar ── */}
          <aside className="booking-sidebar" style={{ background: bg2, borderRight: `1px solid ${border}`, padding: '48px 36px', position: 'sticky', top: navH, height: `calc(100svh - ${navH})`, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Availability</p>
              <h1 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, color: text }}>Book a Session</h1>
              <p style={{ fontSize: '.85rem', color: muted, lineHeight: 1.7, marginTop: '8px' }}>Pick an available date. Booked dates are taken.</p>
            </div>

            {/* Calendar */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button onClick={() => { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11) } else setViewMonth(m=>m-1) }} disabled={isPrevDisabled}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${border}`, background: card, color: muted, fontSize: '.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isPrevDisabled ? .3 : 1 }}>←</button>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: text }}>{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={() => { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0) } else setViewMonth(m=>m+1) }}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${border}`, background: card, color: muted, fontSize: '.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px', marginBottom: '4px' }}>
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '.6rem', fontWeight: 700, color: muted, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '.06em' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' }}>
                {Array.from({ length: firstWeekday }).map((_,i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_,idx) => {
                  const d = idx + 1
                  const dateStr   = `${viewYear}-${pad(viewMonth+1)}-${pad(d)}`
                  const formatted = `${MONTHS[viewMonth]} ${d}, ${viewYear}`
                  const isPast    = dateStr < todayStr
                  const isToday   = dateStr === todayStr
                  const isBooked  = bookedDates.has(dateStr)
                  const isSel     = formatted === selectedDate

                  let bg_  = card
                  let bdr  = border
                  let col  = text
                  let cur  = 'pointer'
                  let op   = 1

                  if (isPast)    { op = .3; cur = 'default' }
                  else if (isBooked) { bg_ = 'rgba(196,122,58,.1)'; bdr = 'rgba(196,122,58,.25)'; col = accent; cur = 'not-allowed' }
                  else if (isSel)    { bg_ = accent; bdr = accent; col = '#1a1208' }
                  else if (isToday)  { bdr = accent }

                  return (
                    <div key={d}
                      onClick={() => !isPast && !isBooked && pickDate(formatted)}
                      style={{ aspectRatio: '1', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: isSel ? 800 : 600, border: `1px solid ${bdr}`, background: bg_, color: col, cursor: cur, opacity: op, transition: 'all .12s' }}
                    >
                      {d}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[{label:'Available',bg:card,bdr:border},{label:'Booked',bg:'rgba(196,122,58,.1)',bdr:'rgba(196,122,58,.25)'},{label:'Past',bg:card,bdr:border,op:.3}].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.7rem', color: muted }}>
                    <span style={{ width: 12, height: 12, borderRadius: '3px', background: l.bg, border: `1px solid ${l.bdr}`, opacity: l.op || 1, flexShrink: 0 }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected date pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'rgba(196,122,58,.08)', border: '1px solid rgba(196,122,58,.2)', borderRadius: '10px' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: accent, flexShrink: 0 }} />
              <div>
                <span style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: muted }}>Selected date</span>
                <strong style={{ display: 'block', fontSize: '.9rem', color: text }}>{selectedDate || 'No date selected yet'}</strong>
              </div>
            </div>

            {/* Host */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${border}` }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(196,122,58,.15)', border: '1px solid rgba(196,122,58,.3)', color: accent, fontWeight: 800, fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>J</div>
              <div>
                <strong style={{ display: 'block', fontSize: '.86rem', color: text }}>James Ignacio</strong>
                <span style={{ display: 'block', fontSize: '.7rem', color: accent, marginTop: '2px', fontWeight: 600 }}>● Zamboanga City, PH</span>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Form ── */}
          <div ref={formRef} style={{ padding: '48px 48px', overflowY: 'auto' }}>
            {success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', padding: '64px 0', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: accent, color: '#1a1208', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: text, letterSpacing: '-.02em' }}>Request sent, {name.split(' ')[0]}!</h2>
                <p style={{ fontSize: '.95rem', color: muted, lineHeight: 1.75, maxWidth: '420px' }}>
                  I&rsquo;ll review your booking and get back to you within 24 hours. Looking forward to working with you.
                </p>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 700, fontSize: '.85rem' }}>← Back to site</Link>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Booking Request</p>
                <h2 style={{ fontSize: 'clamp(1.5rem,2.5vw,2rem)', fontWeight: 800, letterSpacing: '-.02em', color: text, lineHeight: 1.15, marginBottom: '8px' }}>Tell me about your event.</h2>
                <p style={{ fontSize: '.88rem', color: muted, lineHeight: 1.7, marginBottom: '36px' }}>Fill in the details and I&rsquo;ll confirm your booking within 24 hours. No payment required now.</p>

                <form onSubmit={handleSubmit} noValidate>

                  {/* Service */}
                  <div style={{ marginBottom: '28px' }}>
                    <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>Which service do you need? <span style={{ color: '#e07070' }}>*</span></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {SERVICES.map(o => {
                        const checked = services.includes(o.value)
                        return (
                          <label key={o.value} onClick={() => toggleService(o.value)} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 15px', border: `1.5px solid ${checked ? accent : border}`, borderRadius: '10px', cursor: 'pointer', background: checked ? 'rgba(196,122,58,.1)' : card, transition: 'all .15s' }}>
                            <span style={{ width: 18, height: 18, borderRadius: '4px', border: `2px solid ${checked ? accent : muted}`, background: checked ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                              {checked && <span style={{ color: '#1a1208', fontSize: '.7rem', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                            </span>
                            <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0 }}>{o.icon}</span>
                            <span style={{ flex: 1 }}>
                              <strong style={{ display: 'block', fontSize: '.88rem', fontWeight: 700, color: text }}>{o.value}</strong>
                              <small style={{ fontSize: '.75rem', color: muted }}>{o.sub}</small>
                            </span>
                            <span style={{ fontSize: '.78rem', fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
                              ₱{o.basePrice.toLocaleString()}{o.hasHours ? '/3hrs' : ' flat'}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  {showDuration && (
                    <div style={{ marginBottom: '28px' }}>
                      <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>How long do you need?</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {DURATIONS.map((d, i) => (
                          <button key={d.label} type="button" onClick={() => setDurIdx(i)} style={{ padding: '8px 20px', borderRadius: '999px', border: `1.5px solid ${durIdx === i ? accent : border}`, background: durIdx === i ? 'rgba(196,122,58,.12)' : card, color: durIdx === i ? accent : muted, fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimate */}
                  {services.length > 0 && (
                    <div style={{ marginBottom: '28px', padding: '16px 20px', borderRadius: '10px', background: 'rgba(196,122,58,.07)', border: '1px solid rgba(196,122,58,.2)' }}>
                      <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: muted, marginBottom: '6px' }}>Estimated starting price</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: accent, letterSpacing: '-.02em' }}>
                        {dur.custom ? 'Custom quote' : `₱${estimate?.toLocaleString()}`}
                      </p>
                      <p style={{ fontSize: '.74rem', color: muted, marginTop: '4px' }}>{services.join(' + ')} · {dur.label} · Final rate confirmed after consult</p>
                    </div>
                  )}

                  {/* Event details */}
                  <div style={{ marginBottom: '28px' }}>
                    <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>Event details</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { id: 'b-event', label: 'Event or project name', ph: 'e.g. Graduation party, brand shoot', val: eventName, set: setEventName, type: 'text' },
                        { id: 'b-loc',   label: 'Location',             ph: 'Where will this take place?',        val: location,  set: setLocation,  type: 'text' },
                      ].map(f => (
                        <div key={f.id}>
                          <label htmlFor={f.id} style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>{f.label}</label>
                          <input id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box' }}
                            onFocus={e => (e.target.style.borderColor = accent)}
                            onBlur={e  => (e.target.style.borderColor = border)}
                          />
                        </div>
                      ))}
                      <div>
                        <label htmlFor="b-date" style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>Date <span style={{ color: '#e07070' }}>*</span></label>
                        <input id="b-date" type="text" readOnly value={selectedDate} placeholder="← Select a date from the calendar"
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${selectedDate ? accent : border}`, background: card, color: selectedDate ? text : muted, fontSize: '.88rem', fontFamily: 'inherit', cursor: 'default', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label htmlFor="b-details" style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>Additional details</label>
                        <textarea id="b-details" rows={3} value={details} onChange={e => setDetails(e.target.value)} placeholder="Guest count, specific requests, budget range…"
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.88rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box' }}
                          onFocus={e => (e.target.style.borderColor = accent)}
                          onBlur={e  => (e.target.style.borderColor = border)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div style={{ marginBottom: '28px' }}>
                    <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>Your contact info</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { id: 'b-name',  label: 'Full name',     req: true,  ph: 'Juan dela Cruz',     val: name,  set: setName,  type: 'text'  },
                        { id: 'b-email', label: 'Email address', req: true,  ph: 'you@email.com',      val: email, set: setEmail, type: 'email' },
                        { id: 'b-phone', label: 'Phone number',  req: false, ph: '+63 9xx xxx xxxx',   val: phone, set: setPhone, type: 'tel'   },
                      ].map(f => (
                        <div key={f.id}>
                          <label htmlFor={f.id} style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>
                            {f.label} {f.req && <span style={{ color: '#e07070' }}>*</span>}
                          </label>
                          <input id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} required={f.req}
                            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s', boxSizing: 'border-box' }}
                            onFocus={e => (e.target.style.borderColor = accent)}
                            onBlur={e  => (e.target.style.borderColor = border)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <p style={{ fontSize: '.82rem', color: '#f87171', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)' }}>{error}</p>}

                  <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 700, fontSize: '.88rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .6 : 1, letterSpacing: '.04em', fontFamily: 'inherit' }}>
                    {submitting ? 'Sending…' : 'Send Booking Request →'}
                  </button>
                  <p style={{ fontSize: '.75rem', color: muted, textAlign: 'center', marginTop: '12px' }}>No payment needed now — I&rsquo;ll review and confirm within 24 hours.</p>
                </form>
              </>
            )}
          </div>

        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${border}`, padding: '20px 0', background: bg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.78rem', color: muted }}>
          <span>© 2026 James Ignacio · Craftifyle</span>
          <Link href="/" style={{ color: muted }}>Back to site →</Link>
        </div>
      </footer>

      <MessengerFloat />
    </>
  )
}

export default function BookingPageWrapper() {
  return <Suspense><BookingPage /></Suspense>
}
