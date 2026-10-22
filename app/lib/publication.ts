import 'server-only'

export const isArticlePreview = process.env.ARTICLE_PREVIEW === 'true'

export type PublicationStatus = 'draft' | 'scheduled' | 'published'

export const publicationLabels: Record<PublicationStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
}

export function formatPublicationDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Amsterdam',
  }).format(new Date(date))
}
