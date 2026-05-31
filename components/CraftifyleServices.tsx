import Link from 'next/link'

const services = [
  {
    num: '01',
    title: 'Photobooth Service',
    desc: 'Bring the fun to your event. Fully set up, operated, and packed with props — you just show up and enjoy. Perfect for parties, weddings, and corporate events.',
    service: 'Photobooth Service',
  },
  {
    num: '02',
    title: 'Event Photography',
    desc: 'From graduations to corporate events, I capture the real moments — candid, authentic, and worth keeping for life. Not just photos, but a record of something that mattered.',
    service: 'Event Photography',
  },
]

export default function CraftifyleServices() {
  return (
    <section className="services section" id="services">
      <div className="container">
        <p className="section__label">Craftifyle — Zamboanga City</p>
        <h2 className="section__title">What we do.</h2>
        <div className="services-list">
          {services.map(s => (
            <div className="service-row" key={s.num}>
              <span className="service-row__num">{s.num}</span>
              <div className="service-row__body">
                <h3 className="service-row__title">{s.title}</h3>
                <p className="service-row__desc">{s.desc}</p>
              </div>
              <Link href={`/booking?service=${encodeURIComponent(s.service)}`} className="service-row__cta">
                Book Now →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
