import 'server-only'
import { isArticlePreview } from '@/lib/publication'
import { site as publicSite } from '@/lib/site'

export { formatDate } from '@/lib/site'

export const site = {
  ...publicSite,
  url: isArticlePreview ? 'https://preview.crocodillon.com' : publicSite.url,
}
