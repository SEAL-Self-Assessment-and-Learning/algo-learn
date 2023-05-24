import { useState } from "react"
import { AnswerBox } from "../../components/AnswerBox"
import { Question } from "../../components/Question"
import useGlobalDOMEvents from "../../hooks/useGlobalDOMEvents"
import { useSound } from "../../hooks/useSound"
import {
  MultipleChoiceAnswer,
  MultipleChoiceFeedback,
  MultipleChoiceQuestion,
} from "./QuestionGenerator"
import { Markdown } from "../../components/Markdown"

/**
 * ExerciseMultipleChoice is a multiple choice exercise.
 *
 * @param props
 * @param props.question The question.
 * @param props.feedback Ask for feedback after answering.
 * @param props.answers List of answers.
 * @param props.feedback Ask for feedback after answering.
 * @param props.permalink Permalink to the question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.onResult Function to call when the user submits an answer.
 * @param props.viewOnly Whether to disable answering.
 */
export function ExerciseMultipleChoice({
  question,
  feedback,
  regenerate,
  onResult = () => {},
  permalink,
  viewOnly = false,
  source = false,
}: {
  question: MultipleChoiceQuestion
  feedback?: (answer: MultipleChoiceAnswer) => MultipleChoiceFeedback
  regenerate?: () => void
  onResult?: (result: "correct" | "incorrect" | "abort") => void
  permalink?: string
  viewOnly?: boolean
  source?: boolean
}) {
  const { playSound } = useSound()

  // check is the array of indices of the currently checked answers
  const [checked, setChecked] = useState([] as Array<number>)
  function setCheckedEntry(key: number, value: boolean) {
    const newChecked = question.allowMultiple
      ? checked.filter((x) => x !== key)
      : []
    if (value) {
      newChecked.push(key)
    }
    setChecked(newChecked)
  }

  // once the user has submitted an answer, this will be populated with the feedbackText
  const [feedbackOject, setFeedbackObject] = useState(
    undefined as MultipleChoiceFeedback | undefined
  )

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
      if (feedback !== undefined) {
        const feedbackObject = feedback({ choice: checked })
        feedbackObject.correct ? playSound("pass") : playSound("fail")
        setMode(feedbackObject.correct ? "correct" : "incorrect")
        setFeedbackObject(feedbackObject)
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult(mode)
    }
  }

  useGlobalDOMEvents({
    keydown(e: Event) {
      const kbEvent = e as KeyboardEvent
      if (kbEvent.ctrlKey || kbEvent.metaKey || kbEvent.altKey) {
        return
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
      if (!Number.isNaN(num) && num >= 1 && num <= question.answers.length) {
        e.preventDefault()
        const id = num - 1 // answers[num - 1].key
        setCheckedEntry(id, !checked.includes(id))
        return
      }
    },
  })

  let message = null
  if (mode === "correct") {
    message = <b className="text-2xl">Correct!</b>
  } else if (mode === "incorrect") {
    message = feedbackOject?.correctChoice ? (
      <>
        <b className="text-xl">
          Correct solution
          {feedbackOject.correctChoice.length > 1 ? "s" : ""}:
        </b>
        <br />
        {feedbackOject.correctChoice.map((item, index) => (
          <div key={index}>{<Markdown md={question.answers[item]} />}</div>
        ))}
      </>
    ) : (
      <>Incorrect</>
    )
  }
  return (
    <Question
      permalink={permalink}
      title={question.name}
      regenerate={regenerate}
      footerMode={mode}
      footerMessage={message}
      handleFooterClick={handleClick}
      source={source}
    >
      <Markdown md={question.text} />
      <div className="mx-auto flex max-w-max flex-wrap gap-5 p-5">
        {question.answers.map((answer, index) => {
          const id = `${index}`
          return (
            <div key={index} className="flex place-items-center">
              <input
                type={question.allowMultiple ? "checkbox" : "radio"}
                id={id}
                className="peer hidden"
                checked={checked.includes(index)}
                onChange={(e) => {
                  setCheckedEntry(parseInt(e.target.id, 10), e.target.checked)
                }}
                disabled={mode === "correct" || mode === "incorrect"}
              />
              <AnswerBox
                TagName="label"
                disabled={mode === "disabled"}
                htmlFor={id}
                includePeerCheckedStyle
              >
                <Markdown md={answer} />
              </AnswerBox>
            </div>
          )
        })}
      </div>
    </Question>
  )
}
