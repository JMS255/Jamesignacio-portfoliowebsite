'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SchoolPostMeta, Subject } from '@/lib/school-posts'

type Props = {
  posts: SchoolPostMeta[]
}

const SUBJECTS: Subject[] = ['SAD', 'SoftEng']

export default function SchoolBlogTabs({ posts }: Props) {
  const [active, setActive] = useState<Subject>('SAD')
  const filtered = posts.filter(post => post.subjects.includes(active))

  return (
    <>
      <div className="school-tabs">
        {SUBJECTS.map(subject => (
          <button
            key={subject}
            className={`school-tab${active === subject ? ' is-active' : ''}`}
            onClick={() => setActive(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="blog-list">
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', padding: '40px 0' }}>
            No reflections posted for {active} yet.
          </p>
        )}
        {filtered.map(post => (
          <article key={post.slug} className="blog-card">
            <div className="blog-card__meta">
              <span className="blog-card__date">
                {new Date(post.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {post.subjects.map(subject => (
                <span key={subject} className="label-tag label-tag--sm">{subject}</span>
              ))}
              <span className="blog-card__date">{post.readTime}</span>
            </div>
            <h2 className="blog-card__title">
              <Link href={`/school-blog/${post.slug}`} className="link">{post.title}</Link>
            </h2>
            <p className="blog-card__excerpt">{post.excerpt}</p>
            <Link href={`/school-blog/${post.slug}`} className="card__link">Read more →</Link>
          </article>
        ))}
      </div>
    </>
  )
}
