import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import playSound from "../effects/playSound"
import { AnswerBox } from "./AnswerBox"
import { HorizontallyCenteredDiv } from "./CenteredDivs"
import { QuestionFooter } from "./QuestionFooter"
import { QuestionHeader } from "./QuestionHeader"

export function ExerciseMultipleChoice({
  children,
  title,
  answers,
  regenerate,
  onResult = () => {},
  allowMultiple,
  permalink,
}: {
  children: ReactNode
  title: string
  answers: { key: string; correct: boolean; element: ReactNode }[]
  regenerate?: () => void
  onResult?: (result: "correct" | "incorrect" | "abort") => void
  allowMultiple?: boolean
  permalink?: string
}) {
  const { t } = useTranslation()
  const correctAnswers = answers.filter((x) => x.correct).sort()
  if (correctAnswers.length === 0) {
    throw new Error(
      "ExerciseMultipleChoice: At least one correct answer must be provided"
    )
  }
  allowMultiple ??= correctAnswers.length !== 1

  const [checked, setChecked] = useState([] as Array<string>)
  function setCheckedEntry(key: string, value: boolean) {
    const newChecked = allowMultiple ? checked.filter((x) => x !== key) : []
    if (value) {
      newChecked.push(key)
    }
    setChecked(newChecked)
  }

  const [mode, setMode] = useState(
    "disabled" as "disabled" | "verify" | "correct" | "incorrect"
  )
  if (checked.length > 0 && mode == "disabled") {
    setMode("verify")
  } else if (checked.length === 0 && mode === "verify") {
    setMode("disabled")
  }

  function handleClick() {
    if (mode === "disabled") {
      return
    } else if (mode === "verify") {
      const isCorrect =
        checked.length === correctAnswers.length &&
        correctAnswers.every((item) => checked.includes(item.key))
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
        return
      }
      if (mode === "correct" || mode === "incorrect") {
        return
      }
      const num = parseInt(key)
      if (!Number.isNaN(num) && num >= 1 && num <= answers.length) {
        e.preventDefault()
        const id = answers[num - 1].key
        setCheckedEntry(id, !checked.includes(id))
        return
      }
    },
  })
  const message =
    mode === "correct" ? (
      <b className="text-2xl">Correct!</b>
    ) : mode === "incorrect" ? (
      <>
        <b className="text-xl">
          Correct solution{correctAnswers.length > 1 ? "s" : ""}:
        </b>
        <br />
        {correctAnswers.map((item) => (
          <div key={item.key}>{item.element}</div>
        ))}
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
      <div className="mx-auto flex max-w-max flex-wrap gap-5 p-5">
        {answers.map(({ key, element }) => {
          return (
            <div key={key} className="flex place-items-center">
              <input
                type={allowMultiple ? "checkbox" : "radio"}
                id={key}
                className="peer hidden"
                checked={checked.includes(key)}
                onChange={(e) => {
                  setCheckedEntry(e.target.id, e.target.checked)
                }}
                disabled={mode === "correct" || mode === "incorrect"}
              />
              <AnswerBox
                TagName="label"
                disabled={mode === "disabled"}
                htmlFor={key}
                includePeerCheckedStyle
              >
                {element}
              </AnswerBox>
            </div>
          )
        })}
      </div>
      <QuestionFooter
        mode={mode}
        message={message}
        buttonClick={handleClick}
        t={t}
      />
    </HorizontallyCenteredDiv>
  )
}
