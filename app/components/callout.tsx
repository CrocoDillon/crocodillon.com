import type { ReactNode } from 'react'

export function Callout({
  children,
  title = 'A note',
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <aside className="not-prose my-8 rounded-sm border-l-2 border-moss bg-leaf px-6 py-5">
      <p className="mb-2 font-medium text-moss">{title}</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  )
}
