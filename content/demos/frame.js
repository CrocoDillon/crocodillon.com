// Shared site-managed bridge. Keep these messages compatible with frozen demos.
// Parent -> child: { type: 'article-demo-theme', theme: 'light' | 'dark' }.
// Child -> parent: { type: 'article-demo-resize', height: number } (CSS pixels).
// Only the containing article may change the theme.
window.addEventListener('message', event => {
  if (event.source !== parent || event.data?.type !== 'article-demo-theme')
    return
  if (event.data.theme === 'light' || event.data.theme === 'dark') {
    document.documentElement.dataset.theme = event.data.theme
  }
})

// Report layout dimensions only. Form values stay inside the sandbox.
let previousHeight = 0

function reportHeight() {
  const height = Math.ceil(document.body.getBoundingClientRect().height)
  if (height > 0 && height !== previousHeight) {
    previousHeight = height
    parent.postMessage({ type: 'article-demo-resize', height }, '*')
  }
}

window.addEventListener('load', async () => {
  // The first reported height should include the finished font layout.
  await document.fonts.ready
  new ResizeObserver(reportHeight).observe(document.body)
  reportHeight()
})
