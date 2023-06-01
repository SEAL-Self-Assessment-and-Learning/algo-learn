import { HTMLAttributes, ReactElement } from "react"

/**
 * A container for horizontally centered content. Intended to be used as a
 * direct child of <main>.
 *
 * @param props The props to pass to the div.
 * @returns
 */
export function HorizontallyCenteredDiv(
  props: HTMLAttributes<HTMLDivElement>
): ReactElement {
  return (
    <div
      {...props}
      className={`mx-auto block max-w-xl p-3 ${props.className ?? ""}`}
    />
  )
}

/**
 * A container for horizontally and vertically centered content. Intended to be
 * used as a direct child of <main>.
 *
 * @param props The props to pass to the div.
 * @returns
 */
export function ScreenCenteredDiv(
  props: HTMLAttributes<HTMLDivElement>
): ReactElement {
  return (
    <div
      {...props}
      className={`m-auto flex h-full max-w-xl place-items-center p-8 text-xl ${
        props.className ?? ""
      }`}
    />
  )
}
