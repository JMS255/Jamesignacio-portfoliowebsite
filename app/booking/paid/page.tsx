import Link from 'next/link'

const bg     = '#17120e'
const card   = '#251c13'
const border = '#2e2318'
const text   = '#ede5d8'
const muted  = '#9a8b7a'
const accent = '#c47a3a'

export default async function PaidPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; failed?: string }>
}) {
  const { ref, failed } = await searchParams

  if (failed) {
    return (
      <main style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', marginBottom: '20px' }}>😔</p>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: text, letterSpacing: '-.02em', marginBottom: '12px' }}>Payment not completed</h1>
          <p style={{ fontSize: '.9rem', color: muted, lineHeight: 1.7, marginBottom: '32px' }}>
            Your booking request <strong style={{ color: accent, fontFamily: 'monospace' }}>{ref}</strong> is still saved. Message me and I&rsquo;ll help you sort the deposit.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://m.me/craftifylephotobooth" target="_blank" rel="noopener noreferrer"
              style={{ padding: '13px 28px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 700, fontSize: '.88rem', textDecoration: 'none' }}>
              💬 Message Me
            </a>
            <Link href="/" style={{ padding: '13px 28px', borderRadius: '999px', border: `1.5px solid ${border}`, color: muted, fontSize: '.88rem', textDecoration: 'none' }}>
              Back to site
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: accent, color: '#1a1208', fontSize: '1.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontWeight: 800 }}>✓</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: text, letterSpacing: '-.02em', marginBottom: '12px' }}>Deposit received!</h1>
        <p style={{ fontSize: '.9rem', color: muted, lineHeight: 1.7, marginBottom: '8px' }}>
          Your slot is <strong style={{ color: '#4ade80' }}>confirmed</strong>. I&rsquo;ll message you within 24 hours with everything you need to know.
        </p>
        {ref && (
          <p style={{ fontSize: '.8rem', color: muted, marginBottom: '32px' }}>
            Reference: <strong style={{ color: accent, fontFamily: 'monospace' }}>{ref}</strong>
          </p>
        )}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '.82rem', color: muted, lineHeight: 1.65 }}>
            I&rsquo;ll send a confirmation and full details to your number shortly. See you at the shoot! 🎉
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://m.me/craftifylephotobooth" target="_blank" rel="noopener noreferrer"
            style={{ padding: '13px 28px', borderRadius: '999px', background: accent, color: '#1a1208', fontWeight: 700, fontSize: '.88rem', textDecoration: 'none' }}>
            💬 Say hi on Messenger
          </a>
          <Link href="/" style={{ padding: '13px 28px', borderRadius: '999px', border: `1.5px solid ${border}`, color: muted, fontSize: '.88rem', textDecoration: 'none' }}>
            Back to site
          </Link>
        </div>
      </div>
    </main>
  )
}
