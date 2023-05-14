import ReactTeX from "@matejmazur/react-katex"
import "katex/dist/katex.min.css"
import { ReactElement, ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"

/**
 * TeX is a component that renders TeX math expressions.
 *
 * @example
 *   ;```tsx
 *   <TeX>1 + 1 = 2</TeX>
 *   ```
 *
 * @example
 *   ;```tsx
 *   <TeX block>1 + 1 = 2</TeX>
 *   ```
 *
 * @example
 *   ;```tsx
 *   <TeX block source>1 + 1 = 2</TeX>
 *   ```
 *
 * @param props
 * @param props.block Whether to render as a block.
 * @param props.source Whether to print the LaTeX source or render it in react.
 * @param props.children The TeX code to render.
 * @returns The rendered TeX code. If `source` is `true`, the TeX source code is
 *   returned as a ReactElement.
 */
export default function TeX({
  block = false,
  source = false,
  children,
  ...props
}: {
  block?: boolean
  source?: boolean
  children: ReactNode
  props?: Object
}): ReactElement {
  const pureText = renderToStaticMarkup(<>{children}</>)
  if (source) {
    if (block) {
      return <>\[{pureText}\]</>
    } else {
      return <>\({pureText}\)</>
    }
  }
  const component = (
    <ReactTeX {...props} block={false}>
      {pureText}
    </ReactTeX>
  )
  if (block) {
    return <div className="m-3">{component}</div>
  } else {
    return component
  }
}
