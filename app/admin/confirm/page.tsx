'use client'

import { useState } from 'react'

interface ConfirmResult {
  clientReferralCode: string
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res  = await fetch('/api/admin/confirm-booking', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${secret}`,
        },
        body: JSON.stringify({ bookingRef: bookingRef.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setResult(data)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-inter, sans-serif)' }}>
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '460px' }}>
        <h1 style={{ color: '#f5f5f5', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Confirm Booking
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Run after GCash deposit is received.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ color: '#999', fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
              Booking Ref
            </label>
            <input
              value={bookingRef}
              onChange={e => setBookingRef(e.target.value)}
              placeholder="e.g. AB12CD"
              required
              style={{ width: '100%', background: '#1e1e1e', border: '1px solid #333', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', color: '#f5f5f5', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ color: '#999', fontSize: '0.8rem', display: 'block', marginBottom: '0.35rem' }}>
              Admin Secret
            </label>
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              required
              style={{ width: '100%', background: '#1e1e1e', border: '1px solid #333', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', color: '#f5f5f5', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#333' : '#f59e0b', color: loading ? '#666' : '#000', border: 'none', borderRadius: '0.5rem', padding: '0.7rem 1rem', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Confirming…' : 'Confirm Payment'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1rem', background: '#2a1010', border: '1px solid #5a1010', borderRadius: '0.5rem', padding: '0.75rem', color: '#f87171', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <ResultCard
              label="Client's Referral Code"
              value={result.clientReferralCode}
              note="Share this with the client — friends use it for ₱200 off"
            />
            {result.voucherCode && (
              <ResultCard
                label={`Referrer Voucher — ₱${result.voucherAmount} off`}
                value={result.voucherCode}
                note={`Expires: ${result.voucherExpiry ? new Date(result.voucherExpiry).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}`}
              />
            )}
            {!result.voucherCode && (
              <p style={{ color: '#666', fontSize: '0.8rem' }}>No referral code was used — no voucher issued.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: '0.75rem', padding: '0.9rem 1rem' }}>
      <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.3rem' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.05em', flex: 1 }}>{value}</span>
        <button
          onClick={copy}
          style={{ background: copied ? '#166534' : '#262626', color: copied ? '#4ade80' : '#aaa', border: '1px solid #333', borderRadius: '0.4rem', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '0.35rem' }}>{note}</p>
    </div>
  )
}
