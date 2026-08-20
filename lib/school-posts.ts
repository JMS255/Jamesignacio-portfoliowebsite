import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(process.cwd(), 'content', 'school-posts')

export type Subject = 'SAD' | 'SoftEng'

export type SchoolPostMeta = {
  slug: string
  title: string
  date: string
  subjects: Subject[]
  excerpt: string
  readTime: string
}

export type SchoolPost = SchoolPostMeta & {
  content: string
}

export function getAllSchoolPosts(): SchoolPostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')
      const { data } = matter(raw)
      return { slug, ...data } as SchoolPostMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getSchoolPostsBySubject(subject: Subject): SchoolPostMeta[] {
  return getAllSchoolPosts().filter(post => post.subjects.includes(subject))
}

export function getSchoolPost(slug: string): SchoolPost | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return { slug, content, ...data } as SchoolPost
}
