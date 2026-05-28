export default function Contact({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <section className="contact section" id="contact">
      <div className="container contact__inner">
        <p className="section__label">Get in touch</p>
        <h2 className="contact__headline">
          Let&rsquo;s build<br />
          <em>something real.</em>
        </h2>
        <p className="contact__text">Have an event? Need content? Just want to talk? I&rsquo;m here.</p>
        <button className="btn btn--consult btn--lg" onClick={onOpenModal}>
          Book a free consult
        </button>
        <div className="contact__socials">
          <a href="https://www.facebook.com/james.ignacio.483443" className="social-link" target="_blank" rel="noopener noreferrer">Facebook</a>
          <span className="social-dot">&bull;</span>
          <a href="https://www.instagram.com/jamesignacioo/" className="social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
          <span className="social-dot">&bull;</span>
          <a href="mailto:jamesignacio255@gmail.com" className="social-link">Email</a>
        </div>
      </div>
    </section>
  )
}
