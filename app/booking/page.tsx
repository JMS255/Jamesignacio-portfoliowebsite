'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import MessengerFloat from '@/components/MessengerFloat'

// ── Config ──────────────────────────────────────────────────────────────────
const GCAL_API_KEY     = 'AIzaSyBXSHn11u1ZYYkm1k7RgnRtPUfD0c70SXw'
const GCAL_CALENDAR_ID = 'craftifylephotobooth@gmail.com'
const FORMSPREE_ID     = 'maqkqlag'
const DEPOSIT_AMOUNT   = 500

const PHOTOGRAPHY_TIERS = [
  { label: '30–49 guests', min: 30,  max: 49,  price: 3500 },
  { label: '50–70 guests', min: 50,  max: 70,  price: 4000 },
  { label: '80+ guests',   min: 80,  max: 999, price: 4500 },
]
const PHOTOBOOTH_BASE  = 3500
const EXTRA_HR_SOLO    = 1000
const EXTRA_HR_BUNDLE  = 800
const MAGNET_RATE_LOW  = 12.5   // < 100 pcs
const MAGNET_RATE_HIGH = 10     // 100+ pcs

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }
function genRef() { return Math.random().toString(36).slice(2, 8).toUpperCase() }

function magnetCost(qty: number) {
  if (qty <= 0) return 0
  return qty >= 100 ? qty * MAGNET_RATE_HIGH : qty * MAGNET_RATE_LOW
}

type Intent = 'photobooth' | 'photography' | 'both' | 'unsure'

function getRecommendation(intent: Intent, paxTier: number, hours: number) {
  const extraHrRate = intent === 'photography' ? 0 : (intent === 'photobooth' ? EXTRA_HR_SOLO : EXTRA_HR_BUNDLE)
  const extraHrCost = Math.max(0, hours - 3) * extraHrRate

  if (intent === 'photobooth') {
    return {
      name: 'Photobooth Service',
      tag: 'Craftifyle',
      includes: ['Full booth setup & breakdown', 'Props & backdrops included', 'Instant photo prints', 'Operator on-site', `${hours} hours coverage`],
      basePrice: PHOTOBOOTH_BASE,
      extraHrCost,
      extraHrRate,
      isBundle: false,
    }
  }
  if (intent === 'photography') {
    const tier = PHOTOGRAPHY_TIERS[paxTier] ?? PHOTOGRAPHY_TIERS[1]
    return {
      name: 'Event Photography',
      tag: 'Craftifyle',
      includes: ['Full event coverage', 'Fully edited photos', 'Private online gallery', 'Delivered within 48 hours', 'Commercial usage rights'],
      basePrice: tier.price,
      extraHrCost: 0,
      extraHrRate: 0,
      isBundle: false,
    }
  }
  // both or unsure → bundle
  const tier = PHOTOGRAPHY_TIERS[paxTier] ?? PHOTOGRAPHY_TIERS[1]
  return {
    name: 'Photobooth + Photography Bundle',
    tag: 'Best value',
    includes: ['Full booth setup & breakdown', 'Props, backdrops & instant prints', 'Full event photography coverage', 'Edited photos delivered within 48hrs', `${hours} hours coverage`],
    basePrice: PHOTOBOOTH_BASE + tier.price,
    extraHrCost,
    extraHrRate: EXTRA_HR_BUNDLE,
    isBundle: true,
  }
}

// ── Color tokens ─────────────────────────────────────────────────────────────
const bg    = '#17120e'
const bg2   = '#1e1710'
const card  = '#251c13'
const border= '#2e2318'
const text  = '#ede5d8'
const muted = '#9a8b7a'
const accent= '#c47a3a'

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ height: 3, background: border, width: '100%' }}>
      <div style={{ height: '100%', background: accent, width: `${(step / total) * 100}%`, transition: 'width .4s ease' }} />
    </div>
  )
}

function BookingHeader({ step, totalSteps, showBack = false, backFn }: { step: number; totalSteps: number; showBack?: boolean; backFn?: () => void }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `rgba(23,18,14,.97)`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${border}` }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: text, textDecoration: 'none' }}>James Ignacio</Link>
        {showBack
          ? <button onClick={backFn} style={{ background: 'none', border: 'none', color: muted, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
          : <Link href="/" style={{ fontSize: '.78rem', color: muted, textDecoration: 'none' }}>← Back to site</Link>
        }
      </div>
      <ProgressBar step={step - 1} total={totalSteps} />
    </header>
  )
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', background: bg, padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>{children}</div>
    </main>
  )
}

function QLabel({ q, title, sub }: { q: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>{q}</p>
      <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, letterSpacing: '-.03em', color: text, marginBottom: sub ? '8px' : 0 }}>{title}</h1>
      {sub && <p style={{ fontSize: '.88rem', color: muted }}>{sub}</p>}
    </div>
  )
}

function DatePill({ selectedDate }: { selectedDate: string }) {
  if (!selectedDate) return null
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '999px', background: 'rgba(196,122,58,.1)', border: `1px solid rgba(196,122,58,.25)`, marginBottom: '24px' }}>
      <span style={{ fontSize: '.85rem' }}>📅</span>
      <span style={{ fontSize: '.82rem', fontWeight: 700, color: accent }}>{selectedDate}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function BookingPage() {
  const searchParams = useSearchParams()
  const urlDate = searchParams.get('date') || ''

  const today = new Date(); today.setHours(0,0,0,0)
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`

  // wizard state
  const [step, setStep]         = useState(urlDate ? 2 : 1)  // 1=date 2=intent 3=pax 4=hours 5=recommend 6=contact 7=success
  const [selectedDate, setDate] = useState(urlDate)
  const [intent, setIntent]     = useState<Intent | null>(null)
  const [paxTier, setPaxTier]   = useState<number | null>(null)
  const [customPax, setCustomPax] = useState('')
  const [hours, setHours]       = useState(3)
  const [magnets, setMagnets]   = useState(false)
  const [magnetQty, setMagnetQty] = useState(80)
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [showExtra, setShowExtra]       = useState(false)
  const [eventName, setEventName]       = useState('')
  const [location, setLocation]         = useState('')
  const [eventType, setEventType]       = useState('')
  const [customEventType, setCustomET]  = useState('')
  const [eventTime, setEventTime]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [payLoading, setPayLoading]   = useState(false)
  const [promoInput, setPromoInput]   = useState('')
  const [referralInput, setRefInput]  = useState('')
  const [appliedPromo, setPromo]      = useState('')
  const [appliedReferral, setReferral]= useState('')
  const [discount, setDiscount]       = useState<{ promoDiscount: number; referralDiscount: number; creditDiscount: number; final: number } | null>(null)
  const [codeError, setCodeError]     = useState('')
  const [codeLoading, setCodeLoading] = useState(false)

  // calendar state
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [bookedDates, setBooked]  = useState(new Set<string>())
  const fetched = useRef(new Set<string>())

  const fetchBooked = useCallback(async (year: number, month: number) => {
    const key = `${year}-${month}`
    if (fetched.current.has(key)) return
    fetched.current.add(key)
    try {
      const calId = encodeURIComponent(GCAL_CALENDAR_ID)
      const tMin  = new Date(year, month, 1).toISOString()
      const tMax  = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const url   = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${GCAL_API_KEY}&timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime`
      const res   = await fetch(url)
      if (!res.ok) return
      const data  = await res.json()
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

  const firstWeekday   = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate()
  const isPrevDisabled = viewYear === today.getFullYear() && viewMonth <= today.getMonth()

  // derived
  const rec          = intent ? getRecommendation(intent, paxTier ?? 1, hours) : null
  const magCost      = magnets ? magnetCost(magnetQty) : 0
  const totalEstimate = rec ? rec.basePrice + rec.extraHrCost + magCost : 0

  const totalSteps = intent === 'photobooth' ? 5 : 6  // photobooth skips PAX step

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
          name, phone,
          booking_ref: ref,
          date: selectedDate,
          package: rec?.name,
          hours: `${hours} hours`,
          magnets: magnets ? `${magnetQty} pcs — ₱${magCost.toLocaleString()}` : 'None',
          total_estimate: `₱${totalEstimate.toLocaleString()}`,
          event_type: eventType === 'Other' ? (customEventType || 'Other') : eventType || '—',
          event_time: eventTime || '—',
          venue:      location  || '—',
          _subject: `Booking [${ref}] — ${rec?.name} on ${selectedDate}`,
        }),
      })
      if (res.ok) { setBookingRef(ref); setStep(7) }
      else setError('Something went wrong. Please try again.')
    } catch { setError('Could not send. Check your connection.') }
    setSubmitting(false)
  }

  async function applyCode(type: 'promo' | 'referral') {
    const code = type === 'promo' ? promoInput.trim() : referralInput.trim()
    if (!code || !phone) { setCodeError('Enter your phone number in Step 6 first.'); return }
    setCodeLoading(true); setCodeError('')
    try {
      const res = await fetch('/api/validate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice:    totalEstimate,
          clientPhone:  phone,
          packageName:  rec?.name,
          promoCode:    type === 'promo'    ? code : appliedPromo    || undefined,
          referralCode: type === 'referral' ? code : appliedReferral || undefined,
        }),
      })
      const data = await res.json()
      if (data.breakdown.errors.length > 0) {
        setCodeError(data.breakdown.errors[0])
      } else {
        if (type === 'promo')    setPromo(code.toUpperCase())
        if (type === 'referral') setReferral(code.toUpperCase())
        setDiscount(data.breakdown)
        setCodeError('')
      }
    } catch { setCodeError('Could not validate code. Try again.') }
    setCodeLoading(false)
  }

  async function handlePayDeposit() {
    setPayLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef,
          serviceLabel: rec?.name,
          packageName:  rec?.name,
          basePrice:    totalEstimate,
          promoCode:    appliedPromo    || undefined,
          referralCode: appliedReferral || undefined,
          clientPhone:  phone,
          name,
          phone,
        }),
      })
      const data = await res.json()
      if (data.invoiceUrl) window.location.href = data.invoiceUrl
      else { alert(data.error || 'Could not open payment. Please message me on Messenger.') }
    } catch { alert('Network error. Please message me on Messenger.') }
    setPayLoading(false)
  }

  // ── STEP 1: Date ───────────────────────────────────────────────────────────
  if (step === 1) return (
    <>
      <BookingHeader step={step} totalSteps={totalSteps} />
      <Wrap>
        <QLabel q="Question 1" title="When's your event?" sub="Pick an available date. Amber dates are taken." />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button onClick={() => { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11) } else setViewMonth(m=>m-1) }}
            disabled={isPrevDisabled}
            style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${border}`, background: card, color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isPrevDisabled ? .3 : 1, fontSize: '1rem' }}>←</button>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: text }}>{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={() => { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0) } else setViewMonth(m=>m+1) }}
            style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${border}`, background: card, color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>→</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '6px' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '.58rem', fontWeight: 700, color: muted, padding: '4px 0', letterSpacing: '.06em' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px', marginBottom: '24px' }}>
          {Array.from({ length: firstWeekday }).map((_,i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_,idx) => {
            const d       = idx + 1
            const dateStr = `${viewYear}-${pad(viewMonth+1)}-${pad(d)}`
            const fmt     = `${MONTHS[viewMonth]} ${d}, ${viewYear}`
            const isPast  = dateStr < todayStr
            const isToday = dateStr === todayStr
            const isBooked= bookedDates.has(dateStr)
            const isSel   = fmt === selectedDate
            let bgC = card, bdrC = border, colC = text, cur = 'pointer', op = 1
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

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
          {[{l:'Available',bg:card,bdr:border},{l:'Booked',bg:'rgba(196,122,58,.1)',bdr:'rgba(196,122,58,.3)'},{l:'Selected',bg:accent,bdr:accent}].map(x => (
            <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.7rem', color: muted }}>
              <span style={{ width: 12, height: 12, borderRadius: '3px', background: x.bg, border: `1px solid ${x.bdr}`, flexShrink: 0 }} />{x.l}
            </span>
          ))}
        </div>

        <button onClick={() => setStep(2)} disabled={!selectedDate}
          style={{ width: '100%', padding: '16px', borderRadius: '999px', background: selectedDate ? accent : border, color: selectedDate ? '#1a1208' : muted, fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: selectedDate ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all .2s' }}>
          {selectedDate ? `Continue with ${selectedDate} →` : 'Select a date to continue'}
        </button>
      </Wrap>
      <MessengerFloat />
    </>
  )

  // ── STEP 2: Intent ─────────────────────────────────────────────────────────
  if (step === 2) {
    const options: { id: Intent; icon: string; label: string; sub: string }[] = [
      { id: 'photobooth',  icon: '📷', label: 'Photobooth only',  sub: 'Just the booth, props & prints' },
      { id: 'photography', icon: '🎉', label: 'Photography only', sub: 'Full coverage of my event' },
      { id: 'both',        icon: '✨', label: 'Both',             sub: 'Photobooth + photographer' },
      { id: 'unsure',      icon: '🤔', label: 'Not sure yet',     sub: 'Help me figure it out' },
    ]
    return (
      <>
        <BookingHeader step={step} totalSteps={totalSteps} showBack backFn={() => setStep(1)} />
        <Wrap>
          <DatePill selectedDate={selectedDate} />
          <QLabel q="Question 2" title="What are you looking for?" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {options.map(o => {
              const sel = intent === o.id
              return (
                <button key={o.id} onClick={() => { setIntent(o.id); setStep(o.id === 'photobooth' ? 4 : 3) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '14px', border: `1.5px solid ${sel ? accent : border}`, background: sel ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                  <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{o.icon}</span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: text }}>{o.label}</strong>
                    <small style={{ fontSize: '.78rem', color: muted }}>{o.sub}</small>
                  </span>
                  <span style={{ color: muted, fontSize: '1rem' }}>→</span>
                </button>
              )
            })}
          </div>
        </Wrap>
        <MessengerFloat />
      </>
    )
  }

  // ── STEP 3: PAX (photography / both only) ──────────────────────────────────
  if (step === 3) {
    function handleCustomPax(val: string) {
      setCustomPax(val)
      const n = parseInt(val)
      if (!isNaN(n) && n > 0) {
        const tier = n >= 80 ? 2 : n >= 50 ? 1 : 0
        setPaxTier(tier)
      }
    }
    return (
      <>
        <BookingHeader step={step} totalSteps={totalSteps} showBack backFn={() => setStep(2)} />
        <Wrap>
          <DatePill selectedDate={selectedDate} />
          <QLabel q="Question 3" title="How many guests are you expecting?" sub="This helps me recommend the right package for your event." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {PHOTOGRAPHY_TIERS.map((tier, i) => {
              const sel = paxTier === i
              return (
                <button key={tier.label} onClick={() => { setPaxTier(i); setCustomPax(''); setStep(4) }}
                  style={{ padding: '18px 20px', borderRadius: '14px', border: `1.5px solid ${sel ? accent : border}`, background: sel ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s' }}>
                  <strong style={{ fontSize: '1rem', fontWeight: 700, color: text }}>{tier.label}</strong>
                </button>
              )
            })}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: '8px' }}>
              Or type your exact headcount
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" min={1} value={customPax} onChange={e => handleCustomPax(e.target.value)}
                placeholder="e.g. 65"
                style={{ flex: 1, padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${customPax ? accent : border}`, background: card, color: text, fontSize: '1rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s' }}
                onFocus={e => (e.target.style.borderColor = accent)}
                onBlur={e  => (e.target.style.borderColor = customPax ? accent : border)}
              />
              <button onClick={() => { if (paxTier !== null) setStep(4) }} disabled={paxTier === null}
                style={{ padding: '13px 24px', borderRadius: '10px', background: paxTier !== null ? accent : border, color: paxTier !== null ? '#1a1208' : muted, fontWeight: 700, fontSize: '.9rem', border: 'none', cursor: paxTier !== null ? 'pointer' : 'not-allowed', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all .2s' }}>
                Continue →
              </button>
            </div>
            {customPax && paxTier !== null && (
              <p style={{ fontSize: '.75rem', color: accent, marginTop: '6px' }}>
                {parseInt(customPax)} guests → {PHOTOGRAPHY_TIERS[paxTier].label} bracket selected
              </p>
            )}
          </div>
        </Wrap>
        <MessengerFloat />
      </>
    )
  }

  // ── STEP 4: Hours ──────────────────────────────────────────────────────────
  if (step === 4) {
    const hourOptions = [3, 4, 5, 6]
    const extraRate = intent === 'photobooth' ? EXTRA_HR_SOLO : EXTRA_HR_BUNDLE
    return (
      <>
        <BookingHeader step={step} totalSteps={totalSteps} showBack backFn={() => setStep(intent === 'photobooth' ? 2 : 3)} />
        <Wrap>
          <DatePill selectedDate={selectedDate} />
          <QLabel q={intent === 'photobooth' ? 'Question 3' : 'Question 4'} title="How many hours do you need?" sub="Base package is 3 hours. Extra hours can be added." />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {hourOptions.map(h => {
              const sel = hours === h
              const label = h === 6 ? '6+ hrs' : `${h} hrs`
              const extra = h <= 3 ? null : `+₱${((h - 3) * extraRate).toLocaleString()}`
              return (
                <button key={h} onClick={() => setHours(h)}
                  style={{ flex: 1, minWidth: '80px', padding: '16px 12px', borderRadius: '12px', border: `1.5px solid ${sel ? accent : border}`, background: sel ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', transition: 'all .15s' }}>
                  <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 800, color: sel ? accent : text }}>{label}</strong>
                  {extra && <small style={{ fontSize: '.7rem', color: muted }}>{extra}</small>}
                  {!extra && <small style={{ fontSize: '.7rem', color: muted }}>base</small>}
                </button>
              )
            })}
          </div>
          {intent !== 'photography' && (
            <p style={{ fontSize: '.75rem', color: muted, marginBottom: '32px' }}>
              Extra hours: ₱{extraRate.toLocaleString()}/hr{intent !== 'photobooth' ? ' (bundle rate)' : ''}
            </p>
          )}
          <button onClick={() => setStep(5)}
            style={{ width: '100%', padding: '16px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' }}>
            See my recommendation →
          </button>
        </Wrap>
        <MessengerFloat />
      </>
    )
  }

  // ── STEP 5: Recommendation ─────────────────────────────────────────────────
  if (step === 5 && rec) return (
    <>
      <BookingHeader step={step} totalSteps={totalSteps} showBack backFn={() => setStep(4)} />
      <Wrap>
        <DatePill selectedDate={selectedDate} />
        <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>My recommendation</p>
        <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, letterSpacing: '-.03em', color: text, marginBottom: '24px' }}>
          Here&rsquo;s what I&rsquo;d suggest for you.
        </h1>

        {/* Package card */}
        <div style={{ background: card, border: `1.5px solid ${accent}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent }}>{rec.tag}</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: text, marginTop: '4px' }}>{rec.name}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 900, color: accent, letterSpacing: '-.02em', lineHeight: 1 }}>₱{rec.basePrice.toLocaleString()}</p>
              <p style={{ fontSize: '.7rem', color: muted }}>base price</p>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rec.includes.map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '.85rem', color: muted }}>
                <span style={{ color: accent, fontWeight: 700, flexShrink: 0 }}>✓</span>{item}
              </li>
            ))}
          </ul>
          {rec.extraHrCost > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
              <span style={{ color: muted }}>Extra hours ({hours - 3}hr × ₱{rec.extraHrRate.toLocaleString()})</span>
              <span style={{ color: text, fontWeight: 700 }}>+₱{rec.extraHrCost.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Magnets toggle */}
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: magnets ? '16px' : 0 }}>
            <div>
              <p style={{ fontSize: '.9rem', fontWeight: 700, color: text, marginBottom: '2px' }}>Add photo magnets?</p>
              <p style={{ fontSize: '.75rem', color: muted }}>Custom-printed magnets from your photobooth shots</p>
            </div>
            <button onClick={() => setMagnets(v => !v)}
              style={{ width: 44, height: 26, borderRadius: '999px', border: 'none', background: magnets ? accent : border, cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 3, left: magnets ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>

          {magnets && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[{ qty: 80, label: '80 pcs', note: 'good for 70-80 pax' }, { qty: 150, label: '150 pcs', note: 'good for 120+ pax' }].map(p => (
                  <button key={p.qty} onClick={() => setMagnetQty(p.qty)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1.5px solid ${magnetQty === p.qty ? accent : border}`, background: magnetQty === p.qty ? 'rgba(196,122,58,.1)' : card, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                    <strong style={{ display: 'block', fontSize: '.85rem', color: text }}>{p.label}</strong>
                    <small style={{ fontSize: '.7rem', color: muted }}>{p.note}</small>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '.72rem', color: muted, marginBottom: '4px' }}>Custom quantity</label>
                  <input type="number" min={1} value={magnetQty} onChange={e => setMagnetQty(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '.7rem', color: muted, marginBottom: '2px' }}>{magnetQty >= 100 ? '₱10/pc' : '₱12.50/pc'}</p>
                  <p style={{ fontSize: '1.1rem', fontWeight: 800, color: accent }}>₱{magnetCost(magnetQty).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Running total */}
        <div style={{ background: 'rgba(196,122,58,.07)', border: `1px solid rgba(196,122,58,.2)`, borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: muted, marginBottom: '2px' }}>Estimated total</p>
            <p style={{ fontSize: '.72rem', color: muted }}>Final price confirmed after consult</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {discount && discount.promoDiscount + discount.referralDiscount + discount.creditDiscount > 0 && (
              <p style={{ fontSize: '.8rem', color: muted, textDecoration: 'line-through' }}>₱{totalEstimate.toLocaleString()}</p>
            )}
            <p style={{ fontSize: '2rem', fontWeight: 900, color: accent, letterSpacing: '-.03em', lineHeight: 1 }}>
              ₱{(discount?.final ?? totalEstimate).toLocaleString()}
            </p>
          </div>
        </div>

        <button onClick={() => setStep(6)}
          style={{ width: '100%', padding: '16px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          This looks right — let&rsquo;s book it →
        </button>
        <p style={{ textAlign: 'center', fontSize: '.75rem', color: muted, marginTop: '10px' }}>No payment now. ₱500 deposit locks in your date after submitting.</p>
      </Wrap>
      <MessengerFloat />
    </>
  )

  // ── STEP 6: Contact ────────────────────────────────────────────────────────
  if (step === 6) return (
    <>
      <BookingHeader step={step} totalSteps={totalSteps} showBack backFn={() => setStep(5)} />
      <Wrap>
        <DatePill selectedDate={selectedDate} />
        <QLabel q="Almost done" title="How do we reach you?" sub="Just your name and number — I'll handle the rest." />

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {[
              { id: 'b-name',  label: 'Full name',    ph: 'Juan dela Cruz',   val: name,  set: setName,  type: 'text' },
              { id: 'b-phone', label: 'Phone number', ph: '+63 9xx xxx xxxx', val: phone, set: setPhone, type: 'tel'  },
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

          {/* Event type chips */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: accent, marginBottom: '12px' }}>
              Type of event *
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {[
                { id: 'Graduation', icon: '🎓' },
                { id: 'Birthday',   icon: '🎂' },
                { id: 'Wedding',    icon: '💍' },
                { id: 'Corporate',  icon: '🏢' },
                { id: 'Party',      icon: '🎉' },
                { id: 'Other',      icon: '✏️' },
              ].map(t => {
                const sel = eventType === t.id
                return (
                  <button key={t.id} type="button" onClick={() => { setEventType(t.id); if (t.id !== 'Other') setCustomET('') }}
                    style={{ padding: '9px 16px', borderRadius: '999px', border: `1.5px solid ${sel ? accent : border}`, background: sel ? 'rgba(196,122,58,.12)' : card, color: sel ? accent : muted, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all .15s' }}>
                    <span>{t.icon}</span>{t.id}
                  </button>
                )
              })}
            </div>
            {eventType === 'Other' && (
              <input type="text" value={customEventType} onChange={e => setCustomET(e.target.value)} placeholder="What kind of event?"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1.5px solid ${accent}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            )}
          </div>

          {/* Time + Venue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {[
              { id: 'b-time',  label: 'Event time',    ph: 'e.g. 2:00 PM',               val: eventTime, set: setEventTime },
              { id: 'b-venue', label: 'Venue / location', ph: 'e.g. Rizal Hall, ADZU',    val: location,  set: setLocation  },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, color: muted, marginBottom: '6px' }}>{f.label}</label>
                <input id={f.id} type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '10px', border: `1.5px solid ${border}`, background: card, color: text, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e  => (e.target.style.borderColor = border)}
                />
              </div>
            ))}
          </div>

          {/* Promo + Referral codes */}
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: '14px' }}>Have a code?</p>
            {[
              { type: 'promo' as const, label: 'Promo code', input: promoInput, setInput: setPromoInput, applied: appliedPromo },
              { type: 'referral' as const, label: 'Referral code', input: referralInput, setInput: setRefInput, applied: appliedReferral },
            ].map(f => (
              <div key={f.type} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="text" value={f.input} onChange={e => f.setInput(e.target.value.toUpperCase())}
                  placeholder={f.applied ? `✓ ${f.applied} applied` : `Enter ${f.label.toLowerCase()}`}
                  disabled={!!f.applied}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: `1.5px solid ${f.applied ? accent : border}`, background: f.applied ? 'rgba(196,122,58,.08)' : card, color: f.applied ? accent : text, fontSize: '.85rem', fontFamily: 'inherit', outline: 'none' }}
                />
                {!f.applied && (
                  <button type="button" onClick={() => applyCode(f.type)} disabled={!f.input.trim() || codeLoading}
                    style={{ padding: '10px 18px', borderRadius: '8px', background: f.input.trim() ? accent : border, color: f.input.trim() ? '#1a1208' : muted, fontWeight: 700, fontSize: '.82rem', border: 'none', cursor: f.input.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    {codeLoading ? '…' : 'Apply'}
                  </button>
                )}
              </div>
            ))}
            {codeError && <p style={{ fontSize: '.78rem', color: '#f87171', marginTop: '4px' }}>{codeError}</p>}
            {discount && (discount.promoDiscount + discount.referralDiscount + discount.creditDiscount) > 0 && (
              <div style={{ marginTop: '12px', padding: '16px 18px', background: 'rgba(196,122,58,.1)', border: `1.5px solid ${accent}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  {discount.promoDiscount > 0    && <p style={{ fontSize: '.82rem', color: accent, fontWeight: 600 }}>🎟 Promo applied: −₱{discount.promoDiscount.toLocaleString()}</p>}
                  {discount.referralDiscount > 0 && <p style={{ fontSize: '.82rem', color: accent, fontWeight: 600 }}>🤝 Referral: −₱{discount.referralDiscount.toLocaleString()}</p>}
                  {discount.creditDiscount > 0   && <p style={{ fontSize: '.82rem', color: accent, fontWeight: 600 }}>💳 Store credit: −₱{discount.creditDiscount.toLocaleString()}</p>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '.72rem', color: muted, textDecoration: 'line-through' }}>₱{totalEstimate.toLocaleString()}</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 900, color: accent, letterSpacing: '-.02em', lineHeight: 1 }}>₱{discount.final.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Booking summary */}
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
            {[
              { label: 'Date',       value: selectedDate },
              { label: 'Time',       value: eventTime || '—' },
              { label: 'Event type', value: eventType === 'Other' ? (customEventType || 'Other') : (eventType || '—') },
              { label: 'Venue',      value: location || '—' },
              { label: 'Package',    value: rec?.name ?? '' },
              { label: 'Duration',   value: `${hours} hours` },
              { label: 'Magnets',    value: magnets ? `${magnetQty} pcs — ₱${magCost.toLocaleString()}` : 'None' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '4px 0' }}>
                <span style={{ color: muted }}>{row.label}</span>
                <span style={{ color: text, fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
              </div>
            ))}
            {/* Est. total row — shows discounted price if code applied */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.82rem', padding: '8px 0 0', borderTop: `1px solid ${border}`, marginTop: '6px' }}>
              <span style={{ color: muted, fontWeight: 700 }}>Est. total</span>
              <div style={{ textAlign: 'right' }}>
                {discount && discount.final < totalEstimate && (
                  <p style={{ fontSize: '.75rem', color: muted, textDecoration: 'line-through' }}>₱{totalEstimate.toLocaleString()}</p>
                )}
                <p style={{ fontSize: '1.1rem', fontWeight: 900, color: accent, letterSpacing: '-.02em' }}>
                  ₱{(discount?.final ?? totalEstimate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {error && <p style={{ fontSize: '.82rem', color: '#f87171', marginBottom: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)' }}>{error}</p>}

          <button type="submit" disabled={submitting}
            style={{ width: '100%', padding: '16px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 800, fontSize: '.95rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? .6 : 1, fontFamily: 'inherit' }}>
            {submitting ? 'Sending…' : 'Send Booking Request →'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '.75rem', color: muted, marginTop: '10px' }}>50+ events covered · I reply within 24 hours</p>
        </form>
      </Wrap>
      <MessengerFloat />
    </>
  )

  // ── STEP 7: Success ────────────────────────────────────────────────────────
  return (
    <>
      <BookingHeader step={step} totalSteps={totalSteps} />
      <main style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: accent, color: '#1a1208', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>✓</div>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 800, color: text, letterSpacing: '-.02em', marginBottom: '10px' }}>
            Booking request sent, {name.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '.88rem', color: muted, lineHeight: 1.7, marginBottom: '6px' }}>I&rsquo;ll review and get back to you within 24 hours.</p>
          <p style={{ fontSize: '.78rem', color: muted, marginBottom: '28px' }}>
            Reference: <strong style={{ color: accent, fontFamily: 'monospace' }}>{bookingRef}</strong>
          </p>

          {/* Summary */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'left' }}>
            {[
              { label: 'Date',    value: selectedDate },
              { label: 'Package', value: rec?.name ?? '' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', padding: '4px 0' }}>
                <span style={{ color: muted }}>{row.label}</span>
                <span style={{ color: text, fontWeight: 700 }}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 0', borderTop: `1px solid ${border}`, marginTop: '6px' }}>
              <span style={{ fontSize: '.85rem', color: muted }}>Total est.</span>
              <div style={{ textAlign: 'right' }}>
                {discount && discount.final < totalEstimate && (
                  <p style={{ fontSize: '.75rem', color: muted, textDecoration: 'line-through' }}>₱{totalEstimate.toLocaleString()}</p>
                )}
                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: accent }}>₱{(discount?.final ?? totalEstimate).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Deposit CTA */}
          <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '.9rem', fontWeight: 700, color: text, marginBottom: '6px' }}>💸 Lock in your date — ₱500 deposit</p>
            <p style={{ fontSize: '.78rem', color: muted, lineHeight: 1.65, marginBottom: '16px' }}>
              Paying now guarantees your slot. Skip this and I&rsquo;ll still review — but the date isn&rsquo;t reserved until deposit is received.
            </p>
            <button onClick={handlePayDeposit} disabled={payLoading}
              style={{ width: '100%', padding: '14px', borderRadius: '999px', background: payLoading ? border : accent, color: payLoading ? muted : '#1a1208', fontWeight: 800, fontSize: '.9rem', border: 'none', cursor: payLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
              {payLoading ? 'Opening payment…' : `Pay ₱${DEPOSIT_AMOUNT.toLocaleString()} via GCash →`}
            </button>
          </div>

          <a href="https://m.me/craftifylephotobooth" target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: '13px', borderRadius: '999px', border: `1.5px solid ${border}`, color: muted, fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', marginBottom: '24px' }}>
            💬 Or message me directly
          </a>
          <Link href="/" style={{ fontSize: '.78rem', color: muted }}>← Back to site</Link>
        </div>
      </main>
      <MessengerFloat />
    </>
  )
}

export default function BookingPageWrapper() {
  return <Suspense><BookingPage /></Suspense>
}
