import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__inner container">
        <p className="hero__location">&#9679; Zamboanga City, Philippines</p>
        <h1 className="hero__headline">
          <span>Photographer.</span>
          <span>Founder.</span>
          <span>Storyteller.</span>
        </h1>
        <p className="hero__sub">
          Capturing events, building brands, and creating content<br />
          for people who want to be remembered.
        </p>
        <div className="hero__actions">
          <Link href="/booking" className="btn btn--consult">Book a free consult</Link>
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
