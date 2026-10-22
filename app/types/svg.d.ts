declare module '*.svg' {
  import type { ComponentType, SVGProps } from 'react'

  const SVG: ComponentType<SVGProps<SVGSVGElement>>
  export default SVG
}
