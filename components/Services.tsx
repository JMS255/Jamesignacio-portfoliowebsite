const services = [
  { num: '01', title: 'Photobooth Rental', desc: 'Bring the fun to your event. Fully set up, operated, and packed with props — you just show up and enjoy. Perfect for parties, weddings, and corporate events.' },
  { num: '02', title: 'Event Photography', desc: 'From graduations to corporate events, I capture the real moments — candid, authentic, and worth keeping for life. Not just photos, but a record of something that mattered.' },
  { num: '03', title: 'Content Creation', desc: 'Photos and videos made specifically for your social media, brand presence, and marketing. Content that actually performs — not just content for the sake of it.' },
  { num: '04', title: 'Brand Consultation', desc: "Not sure where to start? Let's sit down and build a plan. From brand identity to online presence, I help you find clarity and build something real." },
  { num: '05', title: 'Web Design', desc: 'Clean, fast websites built for small businesses and personal brands. Portfolio sites, business landing pages, and booking pages — designed to look professional and turn visitors into clients.' },
]

export default function Services({ onOpenModal }: { onOpenModal: (service: string) => void }) {
  return (
    <section className="services section" id="services">
      <div className="container">
        <p className="section__label">What I offer</p>
        <div className="services-list">
          {services.map(s => (
            <div className="service-row" key={s.num}>
              <span className="service-row__num">{s.num}</span>
              <div className="service-row__body">
                <h3 className="service-row__title">{s.title}</h3>
                <p className="service-row__desc">{s.desc}</p>
              </div>
              <button className="service-row__cta" onClick={() => onOpenModal(s.title)}>
                Inquire →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
