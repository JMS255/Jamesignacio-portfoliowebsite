const posts = [
  {
    date: 'May 19, 2026',
    tag: 'Entrepreneurship',
    title: 'How I Started Craftifyle With 55,000PHP and Zero Experience',
    excerpt: "I was a second year college student with a scholarship check and no plan. Here's what happened when I decided to bet on myself instead of saving the money.",
  },
  {
    date: 'May 19, 2026',
    tag: 'Lessons',
    title: 'What 17 Months of Running a Business Taught Me About Focus',
    excerpt: "I started a t-shirt business, a stationery business, a detailing service, and a photobooth — all at the same time. Only one survived. Here's why.",
  },
  {
    date: 'May 19, 2026',
    tag: 'Building',
    title: "What I'm Building in 2026 — Craftifyle, a Creative Agency, and Everything In Between",
    excerpt: "Craftifyle is almost 2 years old. The photobooth business that started with ₱55,000 is now evolving into something bigger. Here's where it's all going.",
  },
]

export default function Blog() {
  return (
    <section className="blog section" id="blog">
      <div className="container">
        <p className="section__label">Writing</p>
        <h2 className="section__title">Thoughts on building something real.</h2>
        <div className="blog-list">
          {posts.map(p => (
            <article className="blog-card" key={p.title}>
              <div className="blog-card__meta">
                <span className="blog-card__date">{p.date}</span>
                <span className="label-tag label-tag--sm">{p.tag}</span>
              </div>
              <h3 className="blog-card__title">
                <a href="#" className="link">{p.title}</a>
              </h3>
              <p className="blog-card__excerpt">{p.excerpt}</p>
              <a href="#" className="card__link">Read more →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
