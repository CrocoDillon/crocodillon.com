import { notFound } from 'next/navigation'
import { getPost, getPosts } from '@/lib/posts'
import { createSocialImage } from '@/lib/social-image'
import { formatDate } from '@/lib/site'

export const dynamicParams = false

export async function generateStaticParams() {
  return (await getPosts()).map(({ slug }) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  return createSocialImage({
    title: post.title,
    subtitle: `${formatDate(post.publishedAt)} · ${post.readingMinutes} min read`,
  })
}
