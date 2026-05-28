const faqs = [
  {
    q: 'How far in advance should I book?',
    a: 'For events, at least 2–4 weeks ahead is ideal, though I can sometimes accommodate shorter notice depending on availability. For corporate or commercial shoots, earlier is always better — it gives us time to plan properly. Reach out as soon as you have a date in mind.',
  },
  {
    q: 'Do you travel outside Zamboanga City?',
    a: "Yes — with a travel fee for events outside the city. Where you need me, I'll be there. Just reach out and we'll work out the details together.",
  },
  {
    q: 'What are your payment terms?',
    a: 'A deposit is required to secure your booking date. The remaining balance is due on the day of the event. Exact amounts depend on the scope of the project — we\'ll sort it out during our consult.',
  },
  {
    q: 'How long before I receive my photos?',
    a: "Typically 48–72 hours for event coverage, delivered via a private online gallery. Commercial and brand shoots may take slightly longer depending on the editing required. I'll always give you a clear turnaround time upfront.",
  },
]

export default function FAQ() {
  return (
    <section className="faq section" id="faq">
      <div className="container">
        <p className="section__label">FAQ</p>
        <h2 className="section__title">Common questions.</h2>
        <div className="faq-list">
          {faqs.map(f => (
            <details className="faq-item" key={f.q}>
              <summary className="faq-item__q">{f.q}</summary>
              <p className="faq-item__a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
