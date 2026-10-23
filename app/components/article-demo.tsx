import { getPost } from '@/lib/posts'
import { isArticlePreview } from '@/lib/publication'
import { ArticleDemoClient, type ArticleDemoProps } from './article-demo-client'

export async function ArticleDemo(props: ArticleDemoProps) {
  const post = await getPost(props.slug)
  const analyticsEnabled =
    !isArticlePreview &&
    post?.status === 'published' &&
    process.env.NODE_ENV === 'production' &&
    process.env.VERCEL_ENV === 'production'

  return <ArticleDemoClient {...props} analyticsEnabled={analyticsEnabled} />
}
