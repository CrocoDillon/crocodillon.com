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

window.addEventListener('load', () => {
  new ResizeObserver(reportHeight).observe(document.body)
  reportHeight()
})
