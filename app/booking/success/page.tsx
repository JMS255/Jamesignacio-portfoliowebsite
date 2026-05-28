import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Booking Request Sent — James Ignacio',
  description: 'Your booking request has been received. James will get back to you within 24 hours.',
}

export default function BookingSuccess() {
  return (
    <div style={{ minHeight: '100svh', background: '#17120e', color: '#ede5d8', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '68px', background: 'rgba(23,18,14,.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #2e2318' }}>
        <Link href="/" style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ede5d8' }}>James Ignacio</Link>
        <Link href="/" style={{ fontSize: '.78rem', fontWeight: 600, color: '#9a8b7a', border: '1px solid #2e2318', padding: '8px 18px', borderRadius: '999px' }}>← Back to site</Link>
      </header>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>

          {/* Success icon */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#c47a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '2rem' }}>
            ✓
          </div>

          <p style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#c47a3a', marginBottom: '12px' }}>
            Booking Request Received
          </p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: '16px' }}>
            You&rsquo;re all set!
          </h1>
          <p style={{ fontSize: '1rem', color: '#9a8b7a', lineHeight: 1.75, marginBottom: '36px' }}>
            I&rsquo;ve received your booking request and will get back to you within <strong style={{ color: '#ede5d8' }}>24 hours</strong> to confirm the details. Check your email for a copy.
          </p>

          {/* What's next */}
          <div style={{ background: '#251c13', border: '1px solid #2e2318', borderRadius: '16px', padding: '24px', marginBottom: '36px', textAlign: 'left' }}>
            <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#c47a3a', marginBottom: '16px' }}>What happens next</p>
            {[
              { step: '1', text: "I'll review your request and check availability" },
              { step: '2', text: "I'll contact you within 24 hours to confirm details" },
              { step: '3', text: 'A deposit secures your date — no payment needed now' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(196,122,58,.15)', border: '1px solid rgba(196,122,58,.3)', color: '#c47a3a', fontSize: '.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</span>
                <p style={{ fontSize: '.88rem', color: '#9a8b7a', lineHeight: 1.6, margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', borderRadius: '999px', background: '#c47a3a', color: '#1a1208', fontWeight: 700, fontSize: '.85rem' }}>
              Back to site
            </Link>
            <a href="https://m.me/craftifylePH" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', padding: '13px 28px', borderRadius: '999px', border: '1px solid #2e2318', color: '#9a8b7a', fontSize: '.85rem', fontWeight: 600 }}>
              Message me on Messenger
            </a>
          </div>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid #2e2318', padding: '20px 32px', textAlign: 'center', fontSize: '.78rem', color: '#9a8b7a' }}>
        © 2026 James Ignacio · Craftifyle
      </footer>
    </div>
  )
}
