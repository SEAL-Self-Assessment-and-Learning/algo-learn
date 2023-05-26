import { useState } from "react"
import { AnswerBox } from "./AnswerBox"
import { Question } from "./Question"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { useSound } from "../hooks/useSound"
import {
  MultipleChoiceFeedback,
  MultipleChoiceQuestion,
} from "../api/QuestionGenerator"
import { Markdown } from "./Markdown"
import { Result } from "./QuestionComponent"

/** The current display mode */
export type MODE =
  | "invalid" // Invalid selection (e.g. nothing selected), "Check" button is disabled
  | "draft" // Valid selection (e.g. at least one answer), but not yet submitted
  | "submitted" // "Check" was clicked, feedback was requested
  | "correct" // According to the feedback, the answer was correct
  | "incorrect" // According to the feedbackm, the answer was incorrect

/**
 * ExerciseMultipleChoice is a multiple choice exercise.
 *
 * @param props
 * @param props.question The question.
 * @param props.permalink Permalink to the question (optional)
 * @param props.onResult Function to call after (optional)
 * @param props.regenerate Function to regenerate the question (optional)
 * @param props.viewOnly Whether the exercise is in view-only mode (optional)
 */
export function ExerciseMultipleChoice({
  question,
  permalink,
  onResult,
  regenerate,
  viewOnly = false,
}: {
  question: MultipleChoiceQuestion
  permalink?: string
  onResult?: (result: Result) => void
  regenerate?: () => void
  viewOnly?: boolean
}) {
  const { playSound } = useSound()

  const [state, setState] = useState({
    mode: "invalid" as MODE,

    /** The indices of the selected answers */
    choice: [] as Array<number>,

    /** The feedback object returned by question.feedback() */
    feedbackObject: undefined as MultipleChoiceFeedback | undefined,
  })

  const { mode, choice, feedbackObject } = state

  /**
   * SetChoiceEntry sets the choice for a single entry.
   *
   * @param key The index of the entry
   * @param value Whether the entry should be chosen
   */
  function setChoiceEntry(key: number, value: boolean) {
    const newChoice = question.allowMultiple
      ? choice.filter((x) => x !== key)
      : []
    if (value) {
      newChoice.push(key)
    }
    setState({
      ...state,
      mode: newChoice.length === 0 ? "invalid" : "draft",
      choice: newChoice.sort(),
    })
  }

  function handleClick() {
    if (mode === "invalid") {
      return
    } else if (mode === "draft") {
      if (question.feedback !== undefined) {
        setState({ ...state, mode: "submitted" })
        void Promise.resolve(question.feedback({ choice: choice })).then(
          (feedbackObject) => {
            let mode: MODE = "draft"
            if (feedbackObject.correct === true) {
              playSound("pass")
              mode = "correct"
            } else if (feedbackObject.correct === false) {
              playSound("fail")
              mode = "incorrect"
            }
            setState({ ...state, mode, feedbackObject })
          }
        )
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult && onResult(mode)
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
        setChoiceEntry(id, !choice.includes(id))
        return
      }
    },
  })
  let message = null
  if (mode === "correct") {
    message = <b className="text-2xl">Correct!</b>
  } else if (mode === "incorrect") {
    message = feedbackObject?.correctChoice ? (
      <>
        <b className="text-xl">
          Correct solution
          {feedbackObject.correctChoice.length > 1 ? "s" : ""}:
        </b>
        <br />
        {feedbackObject.correctChoice.map((item, index) => (
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
      footerMode={
        mode === "invalid" || viewOnly
          ? "disabled"
          : mode === "correct"
          ? "correct"
          : mode === "incorrect"
          ? "incorrect"
          : "verify"
      }
      footerMessage={message}
      handleFooterClick={handleClick}
    >
      <Markdown md={question.text ?? ""} />
      <div className="mx-auto flex max-w-max flex-wrap gap-5 p-5">
        {question.answers.map((answer, index) => {
          const id = `${index}`
          return (
            <div key={index} className="flex place-items-center">
              <input
                type={question.allowMultiple ? "checkbox" : "radio"}
                id={id}
                className="peer hidden"
                checked={choice.includes(index)}
                onChange={(e) => {
                  setChoiceEntry(parseInt(e.target.id, 10), e.target.checked)
                }}
                disabled={mode === "correct" || mode === "incorrect"}
              />
              <AnswerBox
                checked={choice.includes(index)}
                correct={feedbackObject?.correctChoice?.includes(index)}
                disabled={mode === "correct" || mode === "incorrect"}
                TagName="label"
                htmlFor={id}
                className="relative"
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
