import { getAllSchoolPosts } from '@/lib/school-posts'
import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SchoolBlogTabs from '@/components/SchoolBlogTabs'

export const metadata: Metadata = {
  title: 'School Blog — James Ignacio',
  description: 'Reflections written for Systems Analysis & Design and Software Engineering.',
}

export default function SchoolBlogIndex() {
  const posts = getAllSchoolPosts()

  return (
    <>
      <Nav />
      <main>
        <section className="section" style={{ paddingTop: 'calc(var(--nav-h) + 80px)' }}>
          <div className="container" style={{ maxWidth: '720px' }}>
            <p className="section__label">School Blog</p>
            <h1 className="section__title">Reflections from SAD & Software Engineering.</h1>
            <p className="section__sub">
              Weekly reflections written for class — thinking out loud about systems analysis, design, and software engineering practice.
            </p>

            <SchoolBlogTabs posts={posts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
