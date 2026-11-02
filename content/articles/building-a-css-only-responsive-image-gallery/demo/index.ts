const gallery = document.querySelector<HTMLDivElement>('.gallery')!
const template = document.querySelector<HTMLTemplateElement>('#photos')!
const count = document.querySelector<HTMLSelectElement>('#image-count')!

function splitIndex(total: number, capacity: number): number {
  const visible = Math.min(total, capacity)
  return visible <= capacity / 2 ? -1 : Math.floor(visible / 2) - 1
}

function render() {
  const total = Number(count.value)
  const images = Array.from(
    template.content.querySelectorAll<HTMLElement>('.gallery-item')
  )
  const fragment = document.createDocumentFragment()
  images.slice(0, Math.min(total, 8)).forEach((source, index) => {
    const item = source.cloneNode(true) as HTMLElement
    const position = index + 1
    if ([4, 6, 8].includes(position) && total > position) {
      const more = document.createElement('span')
      more.className = `gallery-more more-${position}`
      more.textContent = `+${total - position}`
      more.setAttribute('aria-label', `${total - position} additional images`)
      item.append(more)
    }
    fragment.append(item)
    for (const capacity of [4, 6, 8]) {
      if (index === splitIndex(total, capacity)) {
        const rowBreak = document.createElement('span')
        rowBreak.className = `gallery-break break-${capacity}`
        rowBreak.setAttribute('aria-hidden', 'true')
        fragment.append(rowBreak)
      }
    }
  })
  gallery.replaceChildren(fragment)
}

// Only the collection size changes in JavaScript. CSS handles every resize.
count.addEventListener('change', render)
render()
