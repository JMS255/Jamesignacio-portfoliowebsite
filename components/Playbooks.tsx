const playbooks = [
  {
    img: '/images/sellbychat.png',
    tag: 'Events',
    title: 'Craftifyle Sell By Chat System',
    desc: 'How I close my event bookings through Messenger, Instagram without being pushy, annoying or salesy',
  },
  {
    img: '/images/pricingservices.png',
    tag: 'Business',
    title: 'How to Price Your Creative Services Without Underselling Yourself',
    desc: 'The pricing framework, I used to go from guessing my rates to charging with confidence',
  },
  {
    img: '/images/pricingservices.png',
    tag: 'Branding',
    title: 'How to Start a Business From Zero in the Philippines',
    desc: 'No connections, No experience, No mentor. Just 55,000PHP and a decision. Here\'s exactly what I did.',
  },
]

export default function Playbooks() {
  return (
    <section className="playbooks section section--alt" id="playbooks">
      <div className="container">
        <p className="section__label">Playbooks</p>
        <h2 className="section__title">Practical guides to help you grow.</h2>
        <p className="section__sub">Free guides from someone building in the Philippines — No theory, just what works.</p>
        <div className="playbooks-grid">
          {playbooks.map(p => (
            <div className="playbook-card" key={p.title}>
              <div className="client-card__img">
                <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="playbook-card__body">
                <span className="label-tag label-tag--sm">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <a href="#newsletter" className="btn btn--ghost-dark btn--sm">Get via email →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
