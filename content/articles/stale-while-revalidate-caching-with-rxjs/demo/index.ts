import {
  Observable,
  Subscriber,
  ReplaySubject,
  share,
  shareReplay,
  type MonoTypeOperatorFunction,
  type Subscription,
} from 'rxjs'

// share-last.ts

interface ShareLastOptions {
  minRefreshInterval?: number
}

export function shareLast<T>({
  minRefreshInterval = 1_000,
}: ShareLastOptions = {}): MonoTypeOperatorFunction<T> {
  if (!Number.isFinite(minRefreshInterval) || minRefreshInterval < 0) {
    throw new RangeError('minRefreshInterval must be finite and non-negative')
  }

  return source => {
    const subscribers = new Set<Subscriber<T>>()
    let cached: { value: T } | undefined
    let request: Subscriber<T> | undefined
    let completedAt = -Infinity
    let requestVersion = 0

    return new Observable<T>(subscriber => {
      const wasIdle = subscribers.size === 0
      const versionBeforeReplay = requestVersion
      subscribers.add(subscriber)

      subscriber.add(() => {
        if (subscribers.delete(subscriber) && subscribers.size === 0) {
          const pending = request
          request = undefined
          pending?.unsubscribe()
        }
      })

      if (cached) subscriber.next(cached.value)

      if (
        subscriber.closed ||
        request ||
        requestVersion !== versionBeforeReplay
      ) {
        return
      }
      if (!wasIdle && Date.now() - completedAt < minRefreshInterval) return

      const connection = new Subscriber<T>({
        next: value => {
          cached = { value }
          for (const listener of [...subscribers]) listener.next(value)
        },
        error: (error: unknown) => {
          request = undefined
          const listeners = [...subscribers]
          subscribers.clear()
          for (const listener of listeners) listener.error(error)
        },
        complete: () => {
          completedAt = Date.now()
          request = undefined
        },
      })

      request = connection
      requestVersion++
      source.subscribe(connection)
    })
  }
}

// example.ts
type Kind = 'share' | 'replay' | 'resetting' | 'last'
type Listener = {
  subscription?: Subscription
  value?: number
  state: 'listening' | 'complete' | 'error'
}
const policies: [Kind, string, string][] = [
  ['share', 'share()', 'Shares the request; no replay.'],
  ['replay', 'shareReplay', 'Keeps a completed response.'],
  ['resetting', 'share + ReplaySubject(1)', 'Clears its cache on completion.'],
  ['last', 'shareLast()', 'Replays, refreshes, keeps views in sync.'],
]
const names = ['A', 'B', 'C', 'D']
const minRefreshInterval = 1000
const requestDelay = 1800
let server = 1
let selected: string[] = []

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = ''
) {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text
  return node
}

function valueCircle(value: number | undefined) {
  const freshness =
    value === undefined ? 'waiting' : value === server ? 'current' : 'stale'
  const circle = element(
    'span',
    'value-circle',
    value === undefined ? '—' : `v${value}`
  )
  circle.dataset.freshness = freshness
  circle.setAttribute(
    'aria-label',
    value === undefined ? 'No value yet' : `v${value}, ${freshness}`
  )
  return { circle, label: element('span', 'value-state', freshness) }
}

class Comparison {
  readonly card = element('section', 'card')
  readonly cacheView = element('div', 'cache')
  readonly requestView = element('div', 'request')
  readonly subscriberView = element('div', 'subscribers')
  readonly listeners = new Map<string, Listener>()
  readonly result$: Observable<number>
  cached?: number
  requests = 0
  pending?: { id: number; value: number }
  lastRequest = 'No request yet'
  cooldownUntil = 0
  cooldownTimer?: ReturnType<typeof setTimeout>

  constructor(
    readonly kind: Kind,
    title: string,
    policy: string
  ) {
    this.card.dataset.kind = kind
    const heading = element('h2', '', title)
    heading.id = `operator-${kind}`
    this.card.setAttribute('aria-labelledby', heading.id)
    this.cacheView.setAttribute('aria-label', `${title} cache`)
    this.requestView.setAttribute('role', 'status')
    const resource = element('div', 'resource')
    resource.append(this.cacheView, this.requestView)
    this.card.append(
      heading,
      element('p', 'policy', policy),
      resource,
      element('p', 'field-label subscribers-label', 'Subscribers'),
      this.subscriberView
    )

    const get$ = new Observable<number>(subscriber => {
      const id = ++this.requests
      const value = server
      this.pending = { id, value }
      this.render()
      let finished = false
      const timeout = setTimeout(() => {
        finished = true
        this.pending = undefined
        this.lastRequest = `GET #${id} returned v${value}`
        if (kind !== 'share') this.cached = value
        subscriber.next(value)
        subscriber.complete()
        if (kind === 'resetting') this.cached = undefined
        if (kind === 'last') {
          this.cooldownUntil = Date.now() + minRefreshInterval
          clearTimeout(this.cooldownTimer)
          this.cooldownTimer = setTimeout(
            () => this.render(),
            minRefreshInterval + 10
          )
        }
        this.render()
      }, requestDelay)
      return () => {
        clearTimeout(timeout)
        if (!finished) {
          this.pending = undefined
          this.lastRequest = `GET #${id} cancelled`
          if (kind === 'replay' || kind === 'resetting') this.cached = undefined
          this.render()
        }
      }
    })
    switch (kind) {
      case 'share':
        this.result$ = get$.pipe(share())
        break
      case 'replay':
        this.result$ = get$.pipe(shareReplay({ bufferSize: 1, refCount: true }))
        break
      case 'resetting':
        this.result$ = get$.pipe(
          share({ connector: () => new ReplaySubject<number>(1) })
        )
        break
      case 'last':
        this.result$ = get$.pipe(shareLast({ minRefreshInterval }))
        break
    }
    this.render()
  }

  add(name: string) {
    const listener: Listener = { state: 'listening' }
    this.listeners.set(name, listener)
    listener.subscription = this.result$.subscribe({
      next: value => {
        listener.value = value
        this.render()
      },
      complete: () => {
        listener.state = 'complete'
        this.render()
      },
      error: () => {
        listener.state = 'error'
        this.render()
      },
    })
    this.render()
  }

  remove(name: string) {
    const listener = this.listeners.get(name)
    this.listeners.delete(name)
    listener?.subscription?.unsubscribe()
    this.render()
  }

  dispose() {
    for (const name of [...this.listeners.keys()]) this.remove(name)
    clearTimeout(this.cooldownTimer)
  }

  render() {
    const cache = valueCircle(this.cached)
    if (this.cached === undefined) cache.label.textContent = 'empty'
    this.cacheView.replaceChildren(
      element('span', 'field-label', 'Cache'),
      cache.circle,
      cache.label
    )
    const coolingDown =
      this.kind === 'last' &&
      this.listeners.size > 0 &&
      Date.now() < this.cooldownUntil
    const state = this.pending
      ? `Fetching v${this.pending.value}…`
      : coolingDown
        ? 'Refresh pause · 1s'
        : 'No request running'
    const detail = this.pending
      ? `GET #${this.pending.id} · background`
      : this.lastRequest
    const requestText = element('div', 'request-text')
    requestText.append(
      element('span', 'request-state', state),
      element('span', 'request-detail', detail)
    )
    this.requestView.dataset.pending = String(Boolean(this.pending))
    this.requestView.replaceChildren(
      element('span', 'request-dot'),
      requestText
    )
    this.subscriberView.replaceChildren(
      ...Array.from(this.listeners, ([name, listener]) => {
        const row = element('div', 'subscriber')
        row.dataset.subscriber = name
        const square = element('span', 'subscriber-square', name)
        square.setAttribute('aria-label', `Subscriber ${name}`)
        const value = valueCircle(listener.value)
        row.append(
          square,
          element('span', 'connector'),
          value.circle,
          element('span', 'subscriber-state', listener.state),
          value.label
        )
        return row
      })
    )
    if (!this.listeners.size)
      this.subscriberView.append(element('p', 'empty', 'No subscribers'))
  }
}

const cards = document.querySelector<HTMLDivElement>('#cards')!
const add = document.querySelector<HTMLButtonElement>('#add')!
const remove = document.querySelector<HTMLButtonElement>('#remove')!
const removeAll = document.querySelector<HTMLButtonElement>('#remove-all')!
const announcement =
  document.querySelector<HTMLParagraphElement>('#announcement')!
const serverView = document.querySelector<HTMLSpanElement>('#server-value')!
let comparisons: Comparison[] = []

function renderControls(message: string) {
  add.disabled = selected.length === names.length
  remove.disabled = removeAll.disabled = selected.length === 0
  remove.setAttribute(
    'aria-label',
    selected.length
      ? `Remove subscriber ${selected.at(-1)}`
      : 'Remove subscriber'
  )
  serverView.textContent = `v${server}`
  announcement.textContent = `${selected.length} of ${names.length} subscribers. ${message}`
}

function reset() {
  comparisons.forEach(comparison => comparison.dispose())
  server = 1
  selected = []
  comparisons = policies.map(policy => new Comparison(...policy))
  cards.replaceChildren(...comparisons.map(comparison => comparison.card))
  renderControls('Add one to start a request.')
}

add.addEventListener('click', () => {
  if (selected.length === names.length) return
  const name = names[selected.length]
  selected.push(name)
  comparisons.forEach(comparison => comparison.add(name))
  renderControls(`${name} added to every comparison.`)
})
remove.addEventListener('click', () => {
  const name = selected.pop()
  if (!name) return
  comparisons.forEach(comparison => comparison.remove(name))
  renderControls(`${name} removed from every comparison.`)
})
removeAll.addEventListener('click', () => {
  comparisons.forEach(comparison =>
    selected.forEach(name => comparison.remove(name))
  )
  selected = []
  renderControls('Cached responses are retained where the operator allows it.')
})
document.querySelector('#advance')!.addEventListener('click', () => {
  server++
  comparisons.forEach(comparison => comparison.render())
  renderControls(
    `Server changed to v${server}. Add a subscriber to see which operators refresh.`
  )
})
document.querySelector('#reset')!.addEventListener('click', reset)
reset()
