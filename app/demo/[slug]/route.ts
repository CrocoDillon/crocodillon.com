import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { getPost, getPosts } from '@/lib/posts'

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await getPosts()
  const demos = await Promise.all(
    posts.map(async ({ slug }) => {
      try {
        await access(
          path.join(
            process.cwd(),
            'content/articles',
            slug,
            'demo/dist/index.html'
          )
        )
        return { slug }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        return null
      }
    })
  )
  return demos.filter(demo => demo !== null)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  // Apply the article's publication rules to its runnable demo as well.
  if (!(await getPost(slug))) notFound()
  let html: string
  try {
    html = await readFile(
      path.join(
        process.cwd(),
        'content/articles',
        slug,
        'demo/dist/index.html'
      ),
      'utf8'
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') notFound()
    throw error
  }
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Angular's JIT compiler requires eval inside this isolated document only.
      'Content-Security-Policy':
        "default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src data:; img-src data:; frame-ancestors 'self'; sandbox allow-scripts",
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
    },
  })
}
