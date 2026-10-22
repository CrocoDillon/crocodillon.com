type MdxNode = {
  type: string
  name?: string | null
  children?: MdxNode[]
}

// MDX's component mapping covers Markdown links, but explicit JSX tags
// bypass it. Route those anchors through the same shared component.
export default function remarkSiteLinks() {
  return function transform(node: MdxNode): void {
    if (
      (node.type === 'mdxJsxFlowElement' ||
        node.type === 'mdxJsxTextElement') &&
      node.name === 'a'
    ) {
      node.name = 'SiteLink'
    }

    node.children?.forEach(transform)
  }
}
