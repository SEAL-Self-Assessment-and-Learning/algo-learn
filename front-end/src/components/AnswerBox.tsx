import { ReactNode } from "react"

const AnswerBoxStyle = {
  gray: "ring-gray-400 dark:ring-gray-600",
  goethe: "ring-goethe-500 bg-goethe-500/20 dark:bg-goethe-700",
  green:
    "ring-green-500 dark:ring-green-800 bg-green-600/20 dark:bg-green-700/30",
  red: "ring-red-500 dark:ring-red-800 bg-red-600/20 dark:bg-red-700/30",
}

/**
 * AnswerBox is a box that can be used to display an answer option, for example
 * in the multiple choice or sorting exercises.
 *
 * @param props
 * @param props.checked Whether the answer box is checked. (default: false)
 * @param props.correct Whether the answer box is correct. (optional)
 * @param props.TagName The HTML tag to use for the answer box. (default: "div")
 * @param props.disabled Whether the answer box is disabled. (default: false)
 * @param props.className Additional CSS classes to apply to the answer box.
 *   (optional)
 * @param props.htmlFor The ID of the element that the answer box is for. Only
 *   used if the TagName is "label". (optional)
 * @param props.children The contents of the answer box.
 */
export function AnswerBox({
  checked = false,
  correct,
  TagName = "div",
  disabled = false,
  className = "",
  htmlFor,
  children = null,
  ...props
}: {
  checked?: boolean
  correct?: boolean
  TagName?: "div" | "button" | "label"
  disabled?: boolean
  className?: string
  htmlFor?: string
  children?: ReactNode
}) {
  const style =
    correct === undefined
      ? checked
        ? "goethe"
        : "gray"
      : checked
        ? correct
          ? "green"
          : "red"
        : "gray"
  return (
    <TagName
      {...props}
      htmlFor={TagName === "label" ? htmlFor : undefined}
      className={`select-none rounded-lg p-2 ring-4 ${
        disabled
          ? ""
          : "hover:bg-goethe-100 hover:dark:bg-goethe-900 cursor-pointer"
      } ${AnswerBoxStyle[style]} ${className}`}
    >
      {children}
    </TagName>
  )
}
