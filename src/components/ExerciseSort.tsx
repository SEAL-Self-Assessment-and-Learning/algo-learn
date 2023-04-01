import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import playSound from "../effects/playSound"
import { SortableList } from "./SortableList"
import { HorizontallyCenteredDiv } from "./CenteredDivs"
import { QuestionFooter } from "./QuestionFooter"
import { QuestionHeader } from "./QuestionHeader"

export function ExerciseSort({
  children,
  title,
  answers,
  regenerate,
  onResult = () => {},
  permalink,
}: {
  children: ReactNode
  title: string
  answers: { key: string; element: ReactNode; correctIndex: number }[]
  regenerate?: () => void
  onResult?: (result: "correct" | "incorrect" | "abort") => void
  permalink?: string
}) {
  const { t } = useTranslation()
  const [mode, setMode] = useState(
    "verify" as "verify" | "correct" | "incorrect"
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
    } else {
      console.assert(mode === "correct" || mode === "incorrect")
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
    <HorizontallyCenteredDiv>
      <QuestionHeader
        permalink={permalink}
        title={title}
        regenerate={regenerate}
      />
      {children}
      <SortableList
        items={items}
        onChange={setItems}
        className="p-5"
        disabled={mode === "correct" || mode === "incorrect"}
      />
      <QuestionFooter
        mode={mode}
        message={message}
        buttonClick={handleClick}
        t={t}
      />
    </HorizontallyCenteredDiv>
  )
}
