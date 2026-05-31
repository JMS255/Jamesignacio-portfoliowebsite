const testimonials = [
  {
    avatar: 'S',
    quote: '"Thank you so much, Craftifyle! Sa uulitin! Yan enjoy gayod mga bisita man — pabalik balik na booth."',
    name: 'Shareena R.',
    role: '1st Birthday Celebration — Photobooth, January 2026',
  },
  {
    avatar: '✓',
    quote: '"Very professional, and impressed kami sa kinalabasan ng pictures. James is easy to work with, professional, and I\'d work with him again."',
    name: 'Verified Client',
    role: 'Kenny Rogers Roasters — SM City Zamboanga, March 2026',
  },
  {
    avatar: 'A',
    quote: '"Thank you so much for accepting our booking despite the short notice! No one was accepting us na dahil it was too close na. Way beyond satisfied! The quality of the pics are really good, and I\'m still amazed by how fast you could come up with the outline of the strips. Really good service po!"',
    name: 'Abi Nuruddin — Cum Laude',
    role: 'BS Psychology, ADZU — Graduation Photobooth, May 2026',
  },
  {
    avatar: 'N',
    quote: '"Thank you so much for making my grad celebration extra memorable! Super happy ang mga bisita ko sa photobooth. Thank you for being so patient, accommodating, and easy to work with throughout the event. Sobrang worth it, and I\'ll definitely highly recommend you to others."',
    name: 'Nalisha Amil — Cum Laude',
    role: 'BS Management Accounting, ADZU — Graduation Photobooth, May 2026',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials section section--alt" id="testimonials">
      <div className="container">
        <p className="section__label">What clients say</p>
        <h2 className="section__title">Real words from real people.</h2>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div className="tcard" key={t.name}>
              <div className="tcard__stars" aria-label="5 out of 5 stars">★★★★★</div>
              <p className="tcard__quote">{t.quote}</p>
              <div className="tcard__author">
                <div className="tcard__avatar">{t.avatar}</div>
                <div>
                  <strong className="tcard__name">{t.name}</strong>
                  <span className="tcard__role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trusted by strip */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #2e2318', textAlign: 'center' }}>
          <p style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9a8b7a', marginBottom: '16px' }}>Trusted by</p>
          <p style={{ fontSize: '.85rem', color: '#6b5f52', lineHeight: 2 }}>
            Kenny Rogers Roasters &nbsp;·&nbsp; Ateneo de Zamboanga &nbsp;·&nbsp; Mahad Al-Qur&rsquo;an Wal Hadith &nbsp;·&nbsp; South East Learning Center &nbsp;·&nbsp; Camino Nuevo Day Care
          </p>
        </div>
      </div>
    </section>
  )
}
