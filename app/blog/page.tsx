import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Writing — James Ignacio',
  description: 'Thoughts on building a business from zero in the Philippines. Entrepreneurship, photography, and everything in between.',
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <>
      <Nav />
      <main>
        <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + 80px)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <p className="section__label">Writing</p>
            <h1 className="section__title">Thoughts on building something real.</h1>
            <p className="section__sub">
              Stories from building Craftifyle from zero — no theory, just what actually happened.
            </p>

            <div className="blog-list">
              {posts.map(post => (
                <article key={post.slug} className="blog-card">
                  <div className="blog-card__meta">
                    <span className="blog-card__date">
                      {new Date(post.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="label-tag label-tag--sm">{post.tag}</span>
                    <span className="blog-card__date">{post.readTime}</span>
                  </div>
                  <h2 className="blog-card__title">
                    <Link href={`/blog/${post.slug}`} className="link">{post.title}</Link>
                  </h2>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="card__link">Read more →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
