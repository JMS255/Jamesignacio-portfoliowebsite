export default function About({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section className="about section" id="about">
      <div className="container about__inner">
        <div className="about__image">
          <div className="about__photo-placeholder">
            <span>Your photo</span>
          </div>
        </div>
        <div className="about__text">
          <p className="section__label">About me</p>
          <h2 className="about__name">
            James<br />
            <em>Ignacio.</em>
          </h2>
          <p className="about__bio">
            I grew up selling ice cream in grade school to make pocket money. I was always the kid looking for a way to earn, to build something. When I got a scholarship in college, I didn&rsquo;t save the money — I bet it on an idea. That idea became Craftifyle.
          </p>
          <p className="about__bio">
            It wasn&rsquo;t a straight line. I launched a t-shirt brand, a stationery business, a car detailing service — most of them failed. I spread myself too thin and learned hard lessons about focus. But the photobooth survived, because I kept showing up and kept improving.
          </p>
          <p className="about__bio">
            Now, 18 months in, I&rsquo;m the photographer behind 50+ events in Zamboanga City — grand openings, corporate launches, graduations, and everything in between. Through{' '}
            <a href="https://www.facebook.com/craftifylePH" className="link" target="_blank" rel="noopener noreferrer">Craftifyle</a>,
            {' '}I help other businesses build a visual identity they&rsquo;re proud of.
          </p>
          <div className="about__tags">
            {['Photography', 'Web Design', 'Content Creation', 'Branding', 'Zamboanga City'].map(t => (
              <span key={t} className="label-tag">{t}</span>
            ))}
          </div>
          <button className="btn btn--consult" style={{ marginTop: '36px' }} onClick={onOpenModal}>
            Work with me →
          </button>
        </div>
      </div>
    </section>
  )
}
