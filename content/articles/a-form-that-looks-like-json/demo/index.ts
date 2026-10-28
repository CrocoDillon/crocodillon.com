import { createElement as h, useEffect, useState } from 'react'
import type { ChangeEvent, CSSProperties, ReactElement } from 'react'
import { createRoot } from 'react-dom/client'

// The editable tree keeps stable IDs and object order, even for numeric keys.
type Kind = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
interface JsonNode {
  id: number
  key: string
  type: Kind
  value: string
  children: JsonNode[]
}
const kinds: Kind[] = ['string', 'number', 'boolean', 'null', 'object', 'array']
let nextId = 0

function node(type: Kind, key = '', value = ''): JsonNode {
  return {
    id: nextId++,
    key,
    type,
    children: [],
    value: type === 'number' ? '0' : type === 'boolean' ? 'true' : value,
  }
}

function example(): JsonNode {
  const root = node('object')
  const snacks = node('array', 'snacks')
  snacks.children = [
    node('string', '', 'cookies'),
    node('string', '', 'olives'),
  ]
  const plans = node('object', 'plans')
  plans.children = [
    node('string', 'activity', 'make something fun'),
    node('null', 'deadline'),
  ]
  root.children = [
    node('string', 'name', 'CrocoDillon'),
    { ...node('number', 'power level'), value: '9001' },
    node('boolean', 'just for fun'),
    snacks,
    plans,
  ]
  return root
}

function isContainer(entry: JsonNode) {
  return entry.type === 'object' || entry.type === 'array'
}

function validNumber(value: string) {
  return (
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value) &&
    Number.isFinite(Number(value))
  )
}

function errors(entry: JsonNode): string[] {
  const result: string[] = []
  if (entry.type === 'number' && !validNumber(entry.value))
    result.push(
      'Finish the number using JSON notation, for example -2.5 or 1e3 (within the finite JavaScript number range).'
    )
  if (
    entry.type === 'object' &&
    new Set(entry.children.map(child => child.key)).size !==
      entry.children.length
  )
    result.push('Use a different name for each key in the same object.')
  if (isContainer(entry)) result.push(...entry.children.flatMap(errors))
  return result
}

function update(
  tree: JsonNode,
  id: number,
  change: (entry: JsonNode) => JsonNode
): JsonNode {
  if (tree.id === id) return change(tree)
  return {
    ...tree,
    children: tree.children.map(child => update(child, id, change)),
  }
}

interface TextProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  quoted?: boolean
  invalid?: boolean
}

function TextField({
  id,
  label,
  value,
  onChange,
  quoted = false,
  invalid = false,
}: TextProps) {
  const [editing, setEditing] = useState(false)
  const display =
    quoted && !editing ? JSON.stringify(value).slice(1, -1) : value
  return h('input', {
    id,
    'aria-label': label,
    value: display,
    type: 'text',
    className: 'inline-input',
    spellCheck: false,
    autoComplete: 'off',
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? 'json-errors' : undefined,
    style: {
      width: `${Math.max(editing ? 1 : 0, display.length)}ch`,
    } as CSSProperties,
    onFocus: () => setEditing(true),
    onBlur: () => setEditing(false),
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      onChange(event.target.value),
  })
}

interface EntryProps {
  entry: JsonNode
  path: string
  comma?: boolean
  parent?: JsonNode
  index?: number
  change: (id: number, change: (entry: JsonNode) => JsonNode) => void
  focus: (id: string) => void
  announce: (message: string) => void
}

function Entry({
  entry,
  path,
  comma = false,
  parent,
  index = 0,
  change,
  focus,
  announce,
}: EntryProps): ReactElement {
  const container = isContainer(entry)
  const object = entry.type === 'object'
  const label = path || 'root'
  const patch = (values: Partial<JsonNode>) =>
    change(entry.id, current => ({ ...current, ...values }))
  const duplicate =
    parent?.type === 'object' &&
    parent.children.some(
      child => child.id !== entry.id && child.key === entry.key
    )
  const keyField =
    parent?.type === 'object'
      ? h(
          'label',
          { className: 'json-key', htmlFor: `key-${entry.id}` },
          '"',
          h(TextField, {
            id: `key-${entry.id}`,
            label: `Key for ${label}`,
            value: entry.key,
            quoted: true,
            invalid: duplicate,
            onChange: (key: string) => patch({ key }),
          }),
          '"',
          h('span', { className: 'punctuation' }, ': ')
        )
      : null

  let value
  if (container) value = object ? '{' : '['
  else if (entry.type === 'null')
    value = h('span', { className: 'json-null' }, 'null')
  else if (entry.type === 'boolean')
    value = h(
      'button',
      {
        type: 'button',
        className: 'boolean json-boolean',
        'aria-label': `Toggle ${label}: ${entry.value}`,
        'aria-pressed': entry.value === 'true',
        onClick: () =>
          patch({ value: entry.value === 'true' ? 'false' : 'true' }),
      },
      entry.value
    )
  else
    value = h(
      'label',
      {
        className: entry.type === 'string' ? 'json-string' : 'json-number',
        htmlFor: `value-${entry.id}`,
      },
      entry.type === 'string' ? '"' : '',
      h(TextField, {
        id: `value-${entry.id}`,
        label: `Value for ${label}`,
        value: entry.value,
        quoted: entry.type === 'string',
        invalid: entry.type === 'number' && !validNumber(entry.value),
        onChange: (value: string) => patch({ value }),
      }),
      entry.type === 'string' ? '"' : ''
    )

  function move(offset: number) {
    if (!parent) return
    change(parent.id, current => {
      const children = [...current.children]
      const position = children.findIndex(child => child.id === entry.id)
      const target = position + offset
      if (target < 0 || target >= children.length) return current
      ;[children[position], children[target]] = [
        children[target],
        children[position],
      ]
      return { ...current, children }
    })
    announce(`Moved ${label} ${offset < 0 ? 'up' : 'down'}.`)
  }

  function add() {
    let key = 'key'
    let suffix = 2
    while (entry.children.some(child => child.key === key))
      key = `key${suffix++}`
    const child = node('string', key)
    change(entry.id, current => ({
      ...current,
      children: [...current.children, child],
    }))
    focus(`${object ? 'key' : 'value'}-${child.id}`)
    announce(`Added ${object ? 'a property' : 'an item'} to ${label}.`)
  }

  const actions = h(
    'span',
    {
      className: 'entry-actions',
      role: 'group',
      'aria-label': `Controls for ${label}`,
    },
    h(
      'select',
      {
        id: `type-${entry.id}`,
        value: entry.type,
        'aria-label': `Type for ${label}`,
        onChange: (event: ChangeEvent<HTMLSelectElement>) => {
          const type = event.target.value as Kind
          if (type === entry.type) return
          // Changing type starts a fresh value; preserve the entry's ID and key.
          patch({
            type,
            value: type === 'number' ? '0' : type === 'boolean' ? 'true' : '',
            children: [],
          })
          announce(`${label} is now ${type}.`)
        },
      },
      kinds.map(kind => h('option', { key: kind, value: kind }, kind))
    ),
    container
      ? h(
          'button',
          {
            type: 'button',
            onClick: add,
            'aria-label': `Add ${object ? 'property' : 'item'} to ${label}`,
          },
          '+'
        )
      : null,
    parent
      ? h(
          'button',
          {
            type: 'button',
            disabled: index === 0,
            'aria-label': `Move ${label} up`,
            onClick: () => move(-1),
          },
          '↑'
        )
      : null,
    parent
      ? h(
          'button',
          {
            type: 'button',
            disabled: index === parent.children.length - 1,
            'aria-label': `Move ${label} down`,
            onClick: () => move(1),
          },
          '↓'
        )
      : null,
    parent
      ? h(
          'button',
          {
            type: 'button',
            'aria-label': `Delete ${label}`,
            onClick: () => {
              change(parent.id, current => ({
                ...current,
                children: current.children.filter(
                  child => child.id !== entry.id
                ),
              }))
              focus(`type-${parent.id}`)
              announce(`Deleted ${label}.`)
            },
          },
          '×'
        )
      : null
  )

  return h(
    'div',
    { className: 'entry' },
    h(
      'div',
      { className: 'json-line' },
      keyField,
      value,
      !container && comma ? ',' : '',
      actions
    ),
    container
      ? h(
          'div',
          { className: 'children' },
          entry.children.map((child, position) =>
            h(Entry, {
              key: child.id,
              entry: child,
              parent: entry,
              index: position,
              path: object
                ? `${path}[${JSON.stringify(child.key)}]`
                : `${path}[${position}]`,
              comma: position < entry.children.length - 1,
              change,
              focus,
              announce,
            })
          )
        )
      : null,
    container
      ? h(
          'div',
          { className: 'json-line closing' },
          object ? '}' : ']',
          comma ? ',' : ''
        )
      : null
  )
}

function App() {
  const [tree, setTree] = useState(example)
  const [announcement, announce] = useState('')
  const [focusRequest, requestFocus] = useState<{ id: string } | null>(null)
  const problems = [...new Set(errors(tree))]
  useEffect(() => {
    if (focusRequest) document.getElementById(focusRequest.id)?.focus()
  }, [focusRequest])

  return h(
    'form',
    { onSubmit: event => event.preventDefault(), 'aria-label': 'JSON form' },
    h(
      'div',
      {
        className: 'editor-scroll',
        tabIndex: 0,
        role: 'region',
        'aria-label': 'Editable JSON',
      },
      h(
        'div',
        { className: 'json-editor' },
        h(Entry, {
          entry: tree,
          path: '',
          change: (id, change) =>
            setTree(current => update(current, id, change)),
          focus: id => requestFocus({ id }),
          announce,
        })
      )
    ),
    h(
      'div',
      { className: 'form-footer' },
      h(
        'p',
        { className: 'demo-note' },
        'Every line is editable. Type changes start a fresh value.'
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'reset',
          onClick: () => {
            setTree(example())
            announce('Example reset.')
          },
        },
        'Reset'
      )
    ),
    h(
      'div',
      { id: 'json-errors', className: 'errors', role: 'status' },
      problems.join(' ')
    ),
    h(
      'p',
      { className: 'sr-only', role: 'status', 'aria-live': 'polite' },
      announcement
    )
  )
}

createRoot(document.getElementById('root')!).render(h(App))
