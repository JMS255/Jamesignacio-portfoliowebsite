import Link from 'next/link'

const services = [
  {
    num: '01',
    title: 'Content Creation',
    desc: 'Photos and videos made specifically for your social media, brand presence, and marketing. Content that actually performs — not just content for the sake of it.',
    service: 'Content Creation',
  },
  {
    num: '02',
    title: 'Brand Consultation',
    desc: "Not sure where to start? Let's sit down and build a plan. From brand identity to online presence, I help you find clarity and build something real.",
    service: 'Brand Consultation',
  },
  {
    num: '03',
    title: 'Web Design',
    desc: 'Clean, fast websites built for small businesses and personal brands. Portfolio sites, business landing pages, and booking pages — designed to look professional and turn visitors into clients.',
    service: 'Web Design',
  },
]

export default function FreelanceServices() {
  return (
    <section className="services section section--alt" id="freelance">
      <div className="container">
        <p className="section__label">By James Ignacio — Freelance</p>
        <h2 className="section__title">Need something else?</h2>
        <p className="section__sub" style={{ marginBottom: '2rem' }}>Outside of Craftifyle, I take on digital work personally.</p>
        <div className="services-list">
          {services.map(s => (
            <div className="service-row" key={s.num}>
              <span className="service-row__num">{s.num}</span>
              <div className="service-row__body">
                <h3 className="service-row__title">{s.title}</h3>
                <p className="service-row__desc">{s.desc}</p>
              </div>
              <Link href={`/booking?service=${encodeURIComponent(s.service)}`} className="service-row__cta">
                Inquire →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
