export const site = {
  name: 'CrocoDillon',
  url: 'https://crocodillon.com',
  author: 'Dillon de Voor',
  description:
    'Notes on JavaScript, browsers, and the things you learn by building for the web. By Dillon de Voor.',
  github: 'https://github.com/CrocoDillon',
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date))
}
