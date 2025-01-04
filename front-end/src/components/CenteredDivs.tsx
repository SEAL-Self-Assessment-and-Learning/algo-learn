import type { HTMLAttributes, ReactElement } from "react"
import { cn } from "@/lib/utils"

/**
 * A container for horizontally centered content. Intended to be used as a
 * direct child of <main>.
 *
 * @param props The props to pass to the div.
 */
export function HorizontallyCenteredDiv(props: HTMLAttributes<HTMLDivElement>): ReactElement {
  return <div {...props} className={cn("mx-auto block w-full max-w-xl p-3 pt-12", props.className)} />
}

/**
 * A container for horizontally and vertically centered content. Intended to be
 * used as a direct child of <main>.
 *
 * @param props The props to pass to the div.
 */
export function ScreenCenteredDiv(props: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div
      {...props}
      className={cn("m-auto flex h-full max-w-xl place-items-center p-8 text-xl", props.className)}
    />
  )
}
