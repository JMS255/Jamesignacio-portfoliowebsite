import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default function Blog() {
  const posts = getAllPosts()

  return (
    <section className="blog section" id="blog">
      <div className="container">
        <p className="section__label">Writing</p>
        <h2 className="section__title">Thoughts on building something real.</h2>
        <div className="blog-list">
          {posts.map(p => (
            <article className="blog-card" key={p.slug}>
              <div className="blog-card__meta">
                <span className="blog-card__date">
                  {new Date(p.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="label-tag label-tag--sm">{p.tag}</span>
              </div>
              <h3 className="blog-card__title">
                <Link href={`/blog/${p.slug}`} className="link">{p.title}</Link>
              </h3>
              <p className="blog-card__excerpt">{p.excerpt}</p>
              <Link href={`/blog/${p.slug}`} className="card__link">Read more →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
