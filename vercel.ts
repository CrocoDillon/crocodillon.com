export const config = {
  crons:
    process.env.ARTICLE_PREVIEW === 'true'
      ? []
      : [{ path: '/api/cron/publish', schedule: '0 7 * * *' }],
}
