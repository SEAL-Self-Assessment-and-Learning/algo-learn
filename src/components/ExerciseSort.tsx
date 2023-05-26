import { ReactNode, useState } from "react"
import { useTranslation } from "../hooks/useTranslation"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { SortableList } from "./SortableList"
import { useSound } from "../hooks/useSound"
import { Question } from "./Question"

/**
 * ExerciseSort is a reordering exercise.
 *
 * @param props
 * @param props.answers List of answers.
 * @param props.permalink Permalink to the question.
 * @param props.title Title of the question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.children Main section of the question.
 * @param props.onResult Function to call when the user submits an answer.
 * @param props.viewOnly Whether to disable answering.
 */
export function ExerciseSort({
  children,
  title,
  answers,
  regenerate,
  onResult = () => {},
  permalink,
  viewOnly = false,
}: {
  children: ReactNode
  title: string
  answers: { key: string; element: ReactNode; correctIndex: number }[]
  regenerate?: () => void
  onResult?: (result: "correct" | "incorrect" | "abort") => void
  permalink?: string
  viewOnly?: boolean
}) {
  const { t } = useTranslation()
  const { playSound } = useSound()
  const [mode, setMode] = useState(
    (viewOnly ? "disabled" : "verify") as
      | "verify"
      | "correct"
      | "incorrect"
      | "disabled"
  )
  const [items, setItems] = useState(answers)

  function handleClick() {
    if (mode === "verify") {
      let isCorrect = true
      for (let i = 0; i < items.length; i++) {
        isCorrect &&= items[i].correctIndex === i
      }
      setMode(isCorrect ? "correct" : "incorrect")
      isCorrect ? playSound("pass") : playSound("fail")
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
  const message =
    mode === "correct" ? (
      <b className="text-2xl">{t("feedback.correct")}</b>
    ) : mode === "incorrect" ? (
      <>
        <b className="text-lg">{t("feedback.thats-ok")}</b>
        <br />
        {t("feedback.correct-order")}
      </>
    ) : null

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
      <SortableList
        items={items}
        onChange={setItems}
        className="p-5"
        disabled={mode !== "verify"}
      />
    </Question>
  )
}
