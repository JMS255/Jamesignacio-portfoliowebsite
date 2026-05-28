import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPosts } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — James Ignacio`,
    description: post.excerpt,
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <>
      <Nav />
      <main style={{ paddingTop: 'var(--nav-h)' }}>

        {/* Hero */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '64px 0 48px' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <Link href="/blog" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
              ← All posts
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span className="label-tag">{post.tag}</span>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                {new Date(post.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{post.readTime}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: '20px' }}>
              {post.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{post.excerpt}</p>
          </div>
        </div>

        {/* Content */}
        <div className="container" style={{ maxWidth: '720px', padding: '56px 32px 96px' }}>
          <div className="prose">
            <MDXRemote source={post.content} />
          </div>

          {/* Author card */}
          <div style={{ marginTop: '64px', padding: '28px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(196,122,58,.15)', border: '1px solid rgba(196,122,58,.3)', color: 'var(--accent)', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>J</div>
            <div>
              <strong style={{ display: 'block', fontSize: '.9rem', color: 'var(--text)', marginBottom: '4px' }}>James Ignacio</strong>
              <p style={{ fontSize: '.83rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px' }}>
                Photographer, entrepreneur, and founder of Craftifyle. Based in Zamboanga City, Philippines.
              </p>
              <Link href="/booking" style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                Work with me →
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link href="/blog" className="btn btn--ghost-light">← Back to all posts</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
