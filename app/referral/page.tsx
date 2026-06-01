'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Voucher {
  code:       string
  amount:     number
  expires_at: string | null
}

interface LookupResult {
  referralCode: string | null
  vouchers:     Voucher[]
}

export default function ReferralPage() {
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<LookupResult | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res  = await fetch(`/api/referral/lookup?phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setResult(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasAnything = result && (result.referralCode || result.vouchers.length > 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-amber-400 font-bold tracking-tight text-lg">Craftifyle</Link>
        <Link href="/booking" className="text-sm text-neutral-400 hover:text-white transition-colors">Book an event →</Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-1">Your Referral Code</h1>
          <p className="text-neutral-400 text-sm mb-8">
            Enter your phone number to find your code and any vouchers you&apos;ve earned.
          </p>

          <form onSubmit={handleLookup} className="flex gap-2 mb-8">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="09XXXXXXXXX"
              required
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-neutral-600 outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-700 disabled:text-neutral-500 text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              {loading ? '…' : 'Find'}
            </button>
          </form>

          {error && (
            <p className="text-red-400 text-sm mb-6">{error}</p>
          )}

          {result && !hasAnything && (
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 text-center">
              <p className="text-neutral-400 text-sm">No referral code found yet.</p>
              <p className="text-neutral-600 text-xs mt-1">Your code appears here once your deposit is confirmed. Check back after James sends you confirmation.</p>
            </div>
          )}

          {hasAnything && (
            <div className="flex flex-col gap-4">
              {result.referralCode && (
                <ReferralCard code={result.referralCode} />
              )}
              {result.vouchers.map(v => (
                <VoucherCard key={v.code} voucher={v} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const shareText = `Book Craftifyle's photobooth or photography with my code ${code} and get ₱200 off! 📸 craftifyle.business/booking`
  const waUrl     = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#141414] border border-amber-500/20 rounded-xl p-5">
      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Your Referral Code</p>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl font-bold text-amber-400 tracking-widest flex-1">{code}</span>
        <button
          onClick={copy}
          className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${copied ? 'bg-green-900/40 border-green-700 text-green-400' : 'bg-[#1e1e1e] border-[#333] text-neutral-400 hover:text-white'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-neutral-500 text-xs mb-4">
        Share this with friends — they get <span className="text-white">₱200 off</span> their booking, and you earn a voucher for your next event.
      </p>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Share on WhatsApp
      </a>
    </div>
  )
}

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const [copied, setCopied] = useState(false)
  const expiry = voucher.expires_at
    ? new Date(voucher.expires_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  function copy() {
    navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5">
      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Discount Voucher</p>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl font-bold text-white tracking-widest flex-1">{voucher.code}</span>
        <button
          onClick={copy}
          className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${copied ? 'bg-green-900/40 border-green-700 text-green-400' : 'bg-[#1e1e1e] border-[#333] text-neutral-400 hover:text-white'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-neutral-400 text-sm mb-1">
        <span className="text-amber-400 font-semibold">₱{voucher.amount} off</span> your next booking
      </p>
      {expiry && (
        <p className="text-neutral-600 text-xs">Expires {expiry}</p>
      )}
      <p className="text-neutral-600 text-xs mt-2">Enter this code in the booking form at checkout.</p>
    </div>
  )
}
