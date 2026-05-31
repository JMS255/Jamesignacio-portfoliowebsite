import Link from 'next/link'

const craftifyleCards = [
  { tag: 'Photobooth', name: 'Photobooth Service', from: 'From', amount: '₱3,500', items: ['3-hour minimum coverage', 'Props & backdrops included', 'Instant photo prints', 'Full setup & breakdown', 'Operator on-site'], service: 'Photobooth Service', featured: false, badge: undefined, promo: false },
  { tag: 'Photography', name: 'Event Photography', from: 'From', amount: '₱4,500', items: ['3-hour event coverage', 'Fully edited photos', 'Private online gallery', 'Delivered within 48 hours', 'Commercial usage rights'], service: 'Event Photography', featured: true, badge: 'Most Booked', promo: false },
  { tag: '🎉 Promo', name: 'Photobooth + Photography Bundle', from: 'Save', amount: '₱1,500', items: ['Full photobooth setup & coverage', 'Event photography included', 'One team, one event', 'Edited photos + prints delivered', 'Limited slots available'], service: '', featured: false, badge: undefined, promo: true },
]

const freelanceCards = [
  { tag: 'Content', name: 'Content Creation', from: 'From', amount: '₱3,000', items: ['Social media photos & videos', 'Brand-ready outputs', 'Raw files included', '1 round of revisions', 'Delivered within 72 hours'], service: 'Content Creation', featured: false, badge: undefined, promo: false },
  { tag: 'Consultation', name: 'Brand Consultation', from: 'From', amount: '₱1,000', items: ['1-hour focused session', 'Brand strategy & positioning', 'Written action plan', 'Follow-up notes via email', 'Online or in-person'], service: 'Brand Consultation', featured: false, badge: undefined, promo: false },
  { tag: 'Web', name: 'Web Design', from: 'From', amount: '₱8,000', items: ['Custom design (no templates)', 'Mobile responsive', '2 rounds of revisions', 'Domain & hosting guidance', 'Delivered within 2 weeks'], service: 'Web Design', featured: false, badge: undefined, promo: false },
]

function PricingCard({ c }: { c: typeof craftifyleCards[0] }) {
  return (
    <div className={`pricing-card${c.featured ? ' pricing-card--featured' : ''}${c.promo ? ' pricing-card--promo' : ''}`}>
      {c.badge && <div className="pricing-card__badge">{c.badge}</div>}
      <div className="pricing-card__head">
        <span className="label-tag label-tag--sm">{c.tag}</span>
        <h3 className="pricing-card__name">{c.name}</h3>
        <div className="pricing-card__price">
          <span className="pricing-card__from">{c.from}</span>
          <span className="pricing-card__amount">{c.amount}</span>
        </div>
      </div>
      <ul className="pricing-card__list">
        {c.items.map(item => <li key={item}>{item}</li>)}
      </ul>
      <Link
        href={c.service ? `/booking?service=${encodeURIComponent(c.service)}` : '/booking'}
        className="service-row__cta"
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {c.promo ? 'Grab this deal →' : 'Inquire →'}
      </Link>
    </div>
  )
}

export default function Pricing() {
  return (
    <section className="pricing section section--alt" id="pricing">
      <div className="container">
        <p className="section__label">Pricing</p>
        <h2 className="section__title">Simple, transparent rates.</h2>
        <p className="section__sub">All packages are customizable. Reach out and we&rsquo;ll build something that fits your event and budget.</p>

        {/* Craftifyle packages */}
        <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#c47a3a', marginBottom: '16px' }}>Craftifyle Packages</p>
        <div className="pricing-grid" style={{ marginBottom: '40px' }}>
          {craftifyleCards.map(c => <PricingCard key={c.name} c={c} />)}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #2e2318', paddingTop: '40px', marginBottom: '16px' }}>
          <p style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9a8b7a' }}>Freelance Services — by James</p>
        </div>
        <div className="pricing-grid">
          {freelanceCards.map(c => <PricingCard key={c.name} c={c} />)}
        </div>

        <p className="pricing-note">
          All prices are starting rates. Final quote depends on event duration, location, and scope.{' '}
          <a href="#booking" className="link">Check my availability ↓</a>
        </p>
      </div>
    </section>
  )
}
