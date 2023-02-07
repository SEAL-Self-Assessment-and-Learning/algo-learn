import ReactTeX from "@matejmazur/react-katex"
import "katex/dist/katex.min.css"
import { ReactElement, ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"

export default function TeX({
  block = false,
  children,
  ...props
}: {
  block?: boolean
  children: ReactNode
  props?: Object
}): ReactElement {
  if (block) {
    return (
      <div className="m-3">
        <ReactTeX {...props} block={false}>
          {renderToStaticMarkup(<>{children}</>)}
        </ReactTeX>
      </div>
    )
  }
  return <ReactTeX {...props}>{renderToStaticMarkup(<>{children}</>)}</ReactTeX>
}
