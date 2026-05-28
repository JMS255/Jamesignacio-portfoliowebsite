import Link from 'next/link'

const cards = [
  { tag: 'Photobooth', name: 'Photobooth Rental', from: 'From', amount: '₱3,500', items: ['3-hour minimum coverage', 'Props & backdrops included', 'Instant photo prints', 'Full setup & breakdown', 'Operator on-site'], service: 'Photobooth Rental', featured: false, promo: false },
  { tag: 'Photography', name: 'Event Photography', from: 'From', amount: '₱4,500', items: ['3-hour event coverage', 'Fully edited photos', 'Private online gallery', 'Delivered within 48 hours', 'Commercial usage rights'], service: 'Event Photography', featured: true, badge: 'Most Booked', promo: false },
  { tag: 'Content', name: 'Content Creation', from: 'From', amount: '₱3,000', items: ['Social media photos & videos', 'Brand-ready outputs', 'Raw files included', '1 round of revisions', 'Delivered within 72 hours'], service: 'Content Creation', featured: false, promo: false },
  { tag: 'Consultation', name: 'Brand Consultation', from: 'From', amount: '₱1,000', items: ['1-hour focused session', 'Brand strategy & positioning', 'Written action plan', 'Follow-up notes via email', 'Online or in-person'], service: 'Brand Consultation', featured: false, promo: false },
  { tag: 'Web', name: 'Web Design', from: 'From', amount: '₱8,000', items: ['Custom design (no templates)', 'Mobile responsive', '2 rounds of revisions', 'Domain & hosting guidance', 'Delivered within 2 weeks'], service: 'Web Design', featured: false, promo: false },
  { tag: '🎉 Promo', name: 'Photobooth + Photography Bundle', from: 'Save', amount: '₱1,500', items: ['Full photobooth setup & coverage', 'Event photography included', 'One team, one event', 'Edited photos + prints delivered', 'Limited slots available'], service: '', featured: false, promo: true },
]

export default function Pricing() {
  return (
    <section className="pricing section section--alt" id="pricing">
      <div className="container">
        <p className="section__label">Pricing</p>
        <h2 className="section__title">Simple, transparent rates.</h2>
        <p className="section__sub">All packages are customizable. Reach out and we&rsquo;ll build something that fits your event and budget.</p>

        <div className="pricing-grid">
          {cards.map(c => (
            <div key={c.name} className={`pricing-card${c.featured ? ' pricing-card--featured' : ''}${c.promo ? ' pricing-card--promo' : ''}`}>
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
          ))}
        </div>
        <p className="pricing-note">
          All prices are starting rates. Final quote depends on event duration, location, and scope.{' '}
          <a href="#booking" className="link">Check my availability ↓</a>
        </p>
      </div>
    </section>
  )
}
