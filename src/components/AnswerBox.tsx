import { ReactNode } from "react"

export const NORMAL = "NORMAL"
export const CHECKED = "CHECKED"
export const CORRECT = "CORRECT"
export const INCORRECT = "INCORRECT"
export const AnswerBoxStates = [NORMAL, CHECKED, CORRECT, INCORRECT]

export const AnswerBoxStyle = {
  NORMAL: "ring-gray-400 dark:ring-gray-600",
  CHECKED: "ring-goethe-500 bg-goethe-500/20 dark:bg-goethe-700",
  CORRECT:
    "ring-green-500 dark:ring-green-800 bg-green-600/20 dark:bg-green-700/30",
  INCORRECT: "ring-red-500 dark:ring-red-800 bg-red-600/20 dark:bg-red-700/30",
}

const peerCheckedStyle =
  "peer-checked:ring-goethe-500 peer-checked:bg-goethe-500/20 peer-checked:dark:bg-goethe-700"

/**
 * AnswerBox is a box that can be used to display an answer option, for example
 * in the multiple choice or sorting exercises.
 *
 * @param props
 * @param props.state The state of the answer box. Can be one of the following:
 *
 *   - NORMAL: The default state.
 *   - CHECKED: The box is checked, but the answer is not yet submitted.
 *   - CORRECT: The box is checked and the answer is correct.
 *   - INCORRECT: The box is checked and the answer is incorrect.
 *
 * @param props
 * @param props.TagName The HTML tag to use for the answer box. Defaults to
 *   "div".
 * @param props.disabled Whether the answer box is disabled. Defaults to false.
 * @param props.includePeerCheckedStyle Whether to include the peer-checked
 *   style. Defaults to false.
 * @param props.className Additional CSS classes to apply to the answer box.
 * @param props.htmlFor The ID of the element that the answer box is for. Only
 *   used if the TagName is "label".
 * @param props.children The content of the answer box.
 */
export function AnswerBox({
  state = NORMAL,
  TagName = "div",
  disabled = false,
  includePeerCheckedStyle = false,
  className = "",
  htmlFor,
  children = null,
  ...props
}: {
  state?: "NORMAL" | "CHECKED" | "CORRECT" | "INCORRECT"
  TagName?: "div" | "button" | "label"
  disabled?: boolean
  includePeerCheckedStyle?: boolean
  className?: string
  htmlFor?: string
  children?: ReactNode
}) {
  return (
    <TagName
      {...props}
      htmlFor={TagName === "label" ? htmlFor : undefined}
      className={`select-none rounded-lg p-2 shadow-xl ring-4 ${
        disabled
          ? ""
          : "cursor-pointer hover:bg-goethe-100  hover:dark:bg-goethe-900"
      }
      ${AnswerBoxStyle[state]} ${
        includePeerCheckedStyle ? peerCheckedStyle : ""
      } ${className}`}
    >
      {children}
    </TagName>
  )
}
