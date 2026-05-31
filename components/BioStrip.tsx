import Link from 'next/link'

export default function BioStrip() {
  return (
    <div style={{ background: '#1a1410', borderTop: '1px solid #2e2318', borderBottom: '1px solid #2e2318', padding: '28px 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(196,122,58,.15)', border: '1px solid rgba(196,122,58,.3)', color: '#c47a3a', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>J</div>
          <p style={{ fontSize: '.88rem', color: '#9a8b7a', lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: '#ede5d8' }}>James Ignacio</strong> — founder of Craftifyle.{' '}
            18 months in, 50+ events covered, still building.
          </p>
        </div>
        <Link href="/about" style={{ fontSize: '.78rem', fontWeight: 600, color: '#c47a3a', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Read more →
        </Link>
      </div>
    </div>
  )
}
