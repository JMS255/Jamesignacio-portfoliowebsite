import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__inner container">
        <p className="hero__location">&#9679; Zamboanga City, Philippines</p>
        <h1 className="hero__headline">
          <span>Your event deserves</span>
          <span>to look as good</span>
          <span>as it felt.</span>
        </h1>
        <p className="hero__sub">
          Photobooth rentals, event photography, and content creation<br />
          in Zamboanga City — 50+ events covered.
        </p>
        <div className="hero__actions">
          <Link href="/booking?service=Photobooth+%2B+Photography+Bundle" className="btn btn--consult">Book Online — Save ₱500 →</Link>
          <a href="#work" className="btn btn--ghost-light">See my work ↓</a>
        </div>
      </div>
      <div className="hero__scroll" aria-hidden="true">
        <span className="hero__scroll-line" />
        <span>scroll</span>
      </div>
    </section>
  )
}
