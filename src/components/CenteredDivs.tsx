/**
 * A container for horizontally centered content. Intended to be used as a
 * direct child of <main>.
 *
 * @param {Object} props The props to pass to the div.
 * @returns {React.ReactElement}
 */
export function HorizontallyCenteredDiv(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement {
  return (
    <div
      {...props}
      className={`mx-auto mt-5 block max-w-xl ${props.className ?? ""}`}
    />
  )
}

/**
 * A container for horizontally and vertically centered content. Intended to be
 * used as a direct child of <main>.
 *
 * @param {Object} props The props to pass to the div.
 * @returns {React.ReactElement}
 */
export function ScreenCenteredDiv(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement {
  return (
    <div
      {...props}
      className={`m-auto flex h-full max-w-xl place-items-center p-8 text-xl ${
        props.className ?? ""
      }`}
    />
  )
}
