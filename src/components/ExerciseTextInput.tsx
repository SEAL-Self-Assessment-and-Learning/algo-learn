import { ReactNode, useState } from "react"
import { useTranslation } from "../hooks/useTranslation"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { useSound } from "../hooks/useSound"
import { Question } from "./Question"

/**
 * ExerciseTextInput is an exercise that requires the user to type in text.
 *
 * @param props
 * @param props.permalink Permalink to the question.
 * @param props.title Title of the question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.children Main section of the question.
 * @param props.onResult Function to call when the user submits an answer.
 * @param props.viewOnly Whether to disable answering.
 * @param props.possibleCorrectSolution Possible correct solution to show when
 *   the user gets the answer wrong.
 * @param props.feedback Function to generate feedback for the given text.
 * @param props.bottomNote Note to show at the bottom of the question.
 * @param props.prompt Prompt to show at the top of the question.
 */
export function ExerciseTextInput({
  title,
  children,
  prompt,
  feedback,
  bottomNote,
  regenerate,
  onResult = () => {},
  permalink,
  viewOnly = false,
  possibleCorrectSolution,
}: {
  title: string
  children?: ReactNode
  prompt?: ReactNode
  feedback: (text: string) => {
    isValid: boolean
    isCorrect: boolean
    FeedbackText: ReactNode
  }
  bottomNote?: ReactNode
  regenerate?: () => void
  onResult?: (result: "correct" | "incorrect" | "abort") => void
  allowMultiple?: boolean
  permalink?: string
  viewOnly?: boolean
  possibleCorrectSolution?: ReactNode
}) {
  const { t } = useTranslation()
  const { playSound } = useSound()
  const [text, setText] = useState("")
  const [savedMode, setMode] = useState(
    "disabled" as "disabled" | "verify" | "correct" | "incorrect"
  )

  const { isValid, isCorrect, FeedbackText } = feedback(text)
  const msgColor = isValid
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400"
  const mode = !isValid
    ? "disabled"
    : savedMode === "disabled"
    ? "verify"
    : savedMode
  const message =
    mode === "correct" ? (
      <b className="text-2xl">{t("feedback.correct")}</b>
    ) : mode === "incorrect" ? (
      possibleCorrectSolution ? (
        <>
          <b className="text-xl">{t("feedback.possible-correct-solution")}:</b>
          <br />
          {possibleCorrectSolution}
        </>
      ) : (
        <b className="text-2xl">{t("feedback.incorrect")}</b>
      )
    ) : null
  function handleClick() {
    if (mode === "disabled") {
      if (!viewOnly) setMode("verify")
    } else if (mode === "verify") {
      if (FeedbackText === null || !isValid) return
      if (isCorrect) {
        playSound("pass")
        setMode("correct")
      } else {
        playSound("fail")
        setMode("incorrect")
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult(mode)
    }
  }
  useGlobalDOMEvents({
    keydown(e: Event) {
      const key = (e as KeyboardEvent).key
      if (key === "Enter") {
        e.preventDefault()
        handleClick()
      }
    },
  })
  return (
    <Question
      permalink={permalink}
      title={title}
      regenerate={regenerate}
      footerMode={mode}
      footerMessage={message}
      handleFooterClick={handleClick}
    >
      {children}
      <br />
      <br />
      <div className="flex place-items-center gap-2 pl-3">
        {prompt}
        <input
          autoFocus
          type="text"
          onChange={(e) => {
            setText(e.target.value)
          }}
          value={text}
          className="rounded-md bg-gray-300 p-2 dark:bg-gray-900"
          disabled={mode === "correct" || mode === "incorrect"}
        />
        <div className={`flex h-12 items-center ${msgColor}`}>
          <div>{FeedbackText}</div>
        </div>
      </div>
      <div className="py-5 text-slate-600 dark:text-slate-400">
        {bottomNote}
      </div>
    </Question>
  )
}
