// Only the containing article may change the theme; no demo data leaves this frame.
window.addEventListener('message', event => {
  if (event.source !== parent || event.data?.type !== 'article-demo-theme')
    return
  if (event.data.theme === 'light' || event.data.theme === 'dark') {
    document.documentElement.dataset.theme = event.data.theme
  }
})
