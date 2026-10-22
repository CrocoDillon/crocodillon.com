import {
  isArticlePreview,
  publicationLabels,
  type PublicationStatus,
} from '@/lib/publication'

export function PublicationStatusLabel({
  status,
}: {
  status: PublicationStatus
}) {
  if (!isArticlePreview) return null

  return (
    <span className="rounded-sm border border-line bg-leaf px-2 py-1 font-mono text-[11px] text-moss">
      {publicationLabels[status]}
    </span>
  )
}
