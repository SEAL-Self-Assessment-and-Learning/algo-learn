import ReactTeX from "@matejmazur/react-katex"
import "katex/dist/katex.min.css"
import { ReactElement, ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"

/**
 * TeX is a component that renders TeX.
 *
 * @param props
 * @param props.block Whether to render as a block.
 * @param props.children The TeX to render.
 */
export default function TeX({
  block = false,
  children,
  ...props
}: {
  block?: boolean
  children: ReactNode
  props?: Object
}): ReactElement {
  const latex = (
    <ReactTeX {...props} block={false}>
      {renderToStaticMarkup(<>{children}</>)}
    </ReactTeX>
  )
  if (block) {
    return <div className="m-3">{latex}</div>
  } else {
    return latex
  }
}
