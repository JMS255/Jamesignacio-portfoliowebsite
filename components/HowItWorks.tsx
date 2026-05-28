const steps = [
  {
    num: '01',
    title: 'Send your details',
    desc: 'Message me with your event date, location, and what you need. I reply within 24 hours.',
  },
  {
    num: '02',
    title: 'We plan it together',
    desc: 'We lock in the package, confirm everything, and I handle all the setup logistics.',
  },
  {
    num: '03',
    title: 'Enjoy your event',
    desc: 'Show up and be present. I arrive fully set up and take care of everything on the day.',
  },
  {
    num: '04',
    title: 'Receive your photos',
    desc: 'Edited photos delivered to your private gallery within 48 hours. Photobooth prints ready on the spot.',
  },
]

export default function HowItWorks() {
  return (
    <section className="hiw section" id="how-it-works">
      <div className="container">
        <p className="section__label">The process</p>
        <h2 className="section__title">Simple from start to finish.</h2>
        <p className="section__sub">No guessing what happens next. Here&rsquo;s exactly how it works.</p>

        <div className="hiw-grid">
          {steps.map((s, i) => (
            <div className="hiw-card" key={s.num}>
              <div className="hiw-card__connector" aria-hidden="true">
                {i < steps.length - 1 && <span className="hiw-card__line" />}
              </div>
              <div className="hiw-card__num">{s.num}</div>
              <h3 className="hiw-card__title">{s.title}</h3>
              <p className="hiw-card__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
