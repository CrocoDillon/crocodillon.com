export const tags = {
  ai: {
    name: 'AI',
    description: 'Thoughts on AI and how it changes the way we build and work.',
  },
  angular: {
    name: 'Angular',
    description:
      'Angular components, forms, and the details that connect them.',
  },
  blogging: {
    name: 'Blogging',
    description:
      'Writing, publishing, and keeping this little corner of the web going.',
  },
  css: {
    name: 'CSS',
    description:
      'Styles, animation, web fonts, and experiments in the browser.',
  },
  javascript: {
    name: 'JavaScript',
    description:
      'JavaScript language details, browser behavior, and useful workarounds.',
  },
  markdown: {
    name: 'Markdown',
    description:
      'Rendering Markdown and making its syntax tree do useful things.',
  },
  mongodb: {
    name: 'MongoDB',
    description:
      'Notes on MongoDB, from its data model to working with documents.',
  },
  'node-js': {
    name: 'Node.js',
    description:
      'Server-side JavaScript and the problems encountered along the way.',
  },
  performance: {
    name: 'Performance',
    description: 'Loading, caching, and making the wait a little shorter.',
  },
  react: {
    name: 'React',
    description:
      'React components and experiments with interactive interfaces.',
  },
  rxjs: {
    name: 'RxJS',
    description: 'Observables, operators, and sharing asynchronous work.',
  },
} as const

export type TagSlug = keyof typeof tags

export function isTagSlug(value: unknown): value is TagSlug {
  return typeof value === 'string' && Object.hasOwn(tags, value)
}
