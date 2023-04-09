import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import playSound from "../effects/playSound"
import { HorizontallyCenteredDiv } from "./CenteredDivs"
import { QuestionFooter } from "./QuestionFooter"
import { QuestionHeader } from "./QuestionHeader"

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
    <HorizontallyCenteredDiv>
      <QuestionHeader
        title={title}
        regenerate={regenerate}
        permalink={permalink}
      />
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
      <div className="p-5 text-slate-600 dark:text-slate-400">{bottomNote}</div>
      <QuestionFooter
        mode={mode}
        message={message}
        buttonClick={handleClick}
        t={t}
      />
    </HorizontallyCenteredDiv>
  )
}
