'use client'

import { useState } from 'react'

interface ConfirmResult {
  clientReferralCode: string
  personalPromoCode:  string | null
  voucherCode:        string | null
  voucherAmount:      number | null
  voucherExpiry:      string | null
}

export default function AdminConfirmPage() {
  const [bookingRef, setBookingRef] = useState('')
  const [secret,     setSecret]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<ConfirmResult | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  // Welcome code generator state
  const [wcName,    setWcName]    = useState('')
  const [wcPhone,   setWcPhone]   = useState('')
  const [wcLoading, setWcLoading] = useState(false)
  const [wcCode,    setWcCode]    = useState<string | null>(null)
  const [wcError,   setWcError]   = useState<string | null>(null)

  // Lookup state
  const [luPhone,   setLuPhone]   = useState('')
  const [luLoading, setLuLoading] = useState(false)
  const [luResult,  setLuResult]  = useState<{ promos: { code: string; amount: number; expires_at: string | null; active: boolean; used_count: number }[]; referrals: { code: string; active: boolean; booking_ref: string }[] } | null>(null)
  const [luError,   setLuError]   = useState<string | null>(null)

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const res  = await fetch('/api/admin/confirm-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
        body: JSON.stringify({ bookingRef: bookingRef.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setResult(data)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  async function handleWelcomeCode(e: React.FormEvent) {
    e.preventDefault()
    setWcLoading(true); setWcError(null); setWcCode(null)
    try {
      const res  = await fetch('/api/admin/generate-welcome-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${secret}` },
        body: JSON.stringify({ clientPhone: wcPhone.trim(), clientName: wcName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setWcError(data.error ?? 'Something went wrong'); return }
      setWcCode(data.code)
    } catch { setWcError('Network error') }
    finally { setWcLoading(false) }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setLuLoading(true); setLuError(null); setLuResult(null)
    try {
      const res  = await fetch(`/api/admin/lookup-codes?phone=${encodeURIComponent(luPhone.trim())}`, {
        headers: { 'Authorization': `Bearer ${secret}` },
      })
      const data = await res.json()
      if (!res.ok) { setLuError(data.error ?? 'Something went wrong'); return }
      setLuResult(data)
    } catch { setLuError('Network error') }
    finally { setLuLoading(false) }
  }

  const s: React.CSSProperties = {
    width: '100%', background: '#1e1e1e', border: '1px solid #333',
    borderRadius: '0.5rem', padding: '0.6rem 0.75rem', color: '#f5f5f5',
    fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-inter, sans-serif)', gap: '1.5rem' }}>

      {/* ── Shared Secret ───────────────────────────────────────── */}
      <div style={{ background: '#141414', border: '1px solid #f59e0b44', borderRadius: '1rem', padding: '1.25rem 2rem', width: '100%', maxWidth: '460px' }}>
        <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '0.4rem' }}>Admin Secret <span style={{ color: '#f59e0b' }}>— enter once, used by both sections below</span></label>
        <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Your admin secret" style={{ width: '100%', background: '#1e1e1e', border: '1px solid #444', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', color: '#f5f5f5', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* ── Confirm Booking ─────────────────────────────────────── */}
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '460px' }}>
        <h1 style={{ color: '#f5f5f5', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>Confirm Booking</h1>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Run after GCash deposit is received.</p>

        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Field label="Booking Ref">
            <input value={bookingRef} onChange={e => setBookingRef(e.target.value)} placeholder="e.g. AB12CD" required style={s} />
          </Field>
          <Btn loading={loading} label="Confirm Payment" />
        </form>

        {error && <ErrorBox msg={error} />}

        {result && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ResultCard label="Client's Referral Code" value={result.clientReferralCode} note="Share this — friends use it for ₱200 or ₱500 off" />
            {result.personalPromoCode && (
              <ResultCard label="Client's Personal Promo (₱200 off)" value={result.personalPromoCode} note="One-time use, works on any package" />
            )}
            {result.voucherCode && (
              <ResultCard
                label={`Referrer Voucher — ₱${result.voucherAmount} off`}
                value={result.voucherCode}
                note={`Expires: ${result.voucherExpiry ? new Date(result.voucherExpiry).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}`}
              />
            )}
            {!result.voucherCode && (
              <p style={{ color: '#555', fontSize: '0.78rem' }}>No referral code was used — no voucher issued to referrer.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Welcome Code Generator ──────────────────────────────── */}
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '460px' }}>
        <h2 style={{ color: '#f5f5f5', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>Generate Welcome Code</h2>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1.25rem' }}>For past clients — ₱500 off, one-time use, any package.</p>

        <form onSubmit={handleWelcomeCode} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <Field label="Client Name">
            <input value={wcName} onChange={e => setWcName(e.target.value)} placeholder="e.g. Maria Santos" required style={s} />
          </Field>
          <Field label="Client Phone (optional — leave blank if unknown)">
            <input value={wcPhone} onChange={e => setWcPhone(e.target.value)} placeholder="09XXXXXXXXX" style={s} />
          </Field>
          <Btn loading={wcLoading} label="Generate Welcome Code" />
        </form>

        {wcError && <ErrorBox msg={wcError} />}
        {wcCode  && (
          <div style={{ marginTop: '1.25rem' }}>
            <ResultCard label="Welcome Back Code (₱500 off)" value={wcCode} note="DM this to the client on Messenger" />
          </div>
        )}
      </div>

      {/* ── Lookup Existing Codes ───────────────────────────────── */}
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '460px' }}>
        <h2 style={{ color: '#f5f5f5', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem' }}>Look Up Client Codes</h2>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Find all codes tied to a phone number.</p>

        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={luPhone} onChange={e => setLuPhone(e.target.value)} placeholder="09XXXXXXXXX or +639..." required style={{ ...s, flex: 1 }} />
          <button type="submit" disabled={luLoading} style={{ background: luLoading ? '#333' : '#f59e0b', color: luLoading ? '#666' : '#000', border: 'none', borderRadius: '0.5rem', padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.9rem', cursor: luLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {luLoading ? '…' : 'Find'}
          </button>
        </form>

        {luError && <ErrorBox msg={luError} />}

        {luResult && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {luResult.promos.length === 0 && luResult.referrals.length === 0 && (
              <p style={{ color: '#555', fontSize: '0.82rem' }}>No codes found for this number.</p>
            )}
            {luResult.referrals.map(r => (
              <LookupRow key={r.code} code={r.code} label="Referral Code" meta={r.active ? 'Active' : 'Inactive'} active={r.active} />
            ))}
            {luResult.promos.map(p => (
              <LookupRow
                key={p.code}
                code={p.code}
                label={`₱${p.amount} off`}
                meta={p.used_count > 0 ? 'Already used' : p.active ? 'Active' : 'Inactive'}
                active={p.active && p.used_count === 0}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ color: '#888', fontSize: '0.78rem', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
      {children}
    </div>
  )
}

function Btn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} style={{ background: loading ? '#333' : '#f59e0b', color: loading ? '#666' : '#000', border: 'none', borderRadius: '0.5rem', padding: '0.7rem 1rem', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
      {loading ? 'Working…' : label}
    </button>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ marginTop: '1rem', background: '#2a1010', border: '1px solid #5a1010', borderRadius: '0.5rem', padding: '0.75rem', color: '#f87171', fontSize: '0.85rem' }}>
      {msg}
    </div>
  )
}

function LookupRow({ code, label, meta, active }: { code: string; label: string; meta: string; active: boolean }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ background: '#1a1a1a', border: `1px solid ${active ? '#2e2e2e' : '#1e1e1e'}`, borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: active ? 1 : 0.45 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: active ? '#f59e0b' : '#666', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{code}</p>
        <p style={{ color: '#555', fontSize: '0.72rem', marginTop: '2px' }}>{label} · {meta}</p>
      </div>
      {active && (
        <button onClick={copy} style={{ background: copied ? '#166534' : '#262626', color: copied ? '#4ade80' : '#aaa', border: '1px solid #333', borderRadius: '0.4rem', padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0 }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  )
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
  const [copied, setCopied] = useState(false)
  function copy() { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '0.75rem', padding: '0.9rem 1rem' }}>
      <p style={{ color: '#777', fontSize: '0.72rem', marginBottom: '0.3rem' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em', flex: 1 }}>{value}</span>
        <button onClick={copy} style={{ background: copied ? '#166534' : '#262626', color: copied ? '#4ade80' : '#aaa', border: '1px solid #333', borderRadius: '0.4rem', padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p style={{ color: '#4a4a4a', fontSize: '0.72rem', marginTop: '0.3rem' }}>{note}</p>
    </div>
  )
}
