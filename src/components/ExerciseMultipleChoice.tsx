import { ReactNode, useState } from "react"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { AnswerBox } from "./AnswerBox"
import { useSound } from "../hooks/useSound"
import { Question } from "./Question"

/**
 * ExerciseMultipleChoice is a multiple choice exercise.
 *
 * @param props
 * @param props.answers List of answers.
 * @param props.permalink Permalink to the question.
 * @param props.title Title of the question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.children Main section of the question.
 * @param props.onResult Function to call when the user submits an answer.
 * @param props.allowMultiple Whether to allow multiple answers.
 * @param props.viewOnly Whether to disable answering.
 */
export function ExerciseMultipleChoice({
  children,
  title,
  answers,
  regenerate,
  onResult = () => {},
  allowMultiple,
  permalink,
  viewOnly = false,
}: {
  children: ReactNode
  title: string
  answers: { key: string; correct: boolean; element: ReactNode }[]
  regenerate?: () => void
  onResult?: (result: "correct" | "incorrect" | "abort") => void
  allowMultiple?: boolean
  permalink?: string
  viewOnly?: boolean
}) {
  const { playSound } = useSound()
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
  if (mode == "disabled" && checked.length > 0) {
    if (!viewOnly) setMode("verify")
  } else if (mode === "verify" && checked.length === 0) {
    setMode("disabled")
  }

  function handleClick() {
    console.log("handleClick", mode)
    if (mode === "disabled") {
      return
    } else if (mode === "verify") {
      const isCorrect =
        checked.length === correctAnswers.length &&
        correctAnswers.every((item) => checked.includes(item.key))
      isCorrect ? playSound("pass") : playSound("fail")
      setMode(isCorrect ? "correct" : "incorrect")
    } else if (mode === "correct" || mode === "incorrect") {
      onResult(mode)
    }
  }

  useGlobalDOMEvents({
    keydown(e: Event) {
      const kbEvent = e as KeyboardEvent;
      if (kbEvent.ctrlKey || kbEvent.metaKey || kbEvent.altKey) {
        return;
      }

      if (kbEvent.key === "Enter") {
        e.preventDefault()
        handleClick()
        return
      }
      if (mode === "correct" || mode === "incorrect") {
        return
      }
      const num = parseInt(kbEvent.key)
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
    <Question
      permalink={permalink}
      title={title}
      regenerate={regenerate}
      footerMode={mode}
      footerMessage={message}
      handleFooterClick={handleClick}
    >
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
    </Question>
  )
}
