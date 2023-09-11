import { useState } from "react"

import {
  MultipleChoiceFeedback,
  MultipleChoiceQuestion,
} from "../../../shared/src/api/QuestionGenerator"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { useSound } from "../hooks/useSound"
import { useTranslation } from "../hooks/useTranslation"
import { AnswerBox } from "./AnswerBox"
import { InteractWithQuestion, MODE } from "./InteractWithQuestion"
import { Markdown } from "./Markdown"
import { Result } from "./QuestionComponent"
import { BaseItem, SortableList } from "./SortableList"

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
}: {
  question: MultipleChoiceQuestion
  permalink?: string
  onResult?: (result: Result) => void
  regenerate?: () => void
}) {
  const { playSound } = useSound()
  const { t } = useTranslation()

  const [state, setState] = useState({
    mode: (question.sorting ? "draft" : "invalid") as MODE,

    /** The indices of the selected answers */
    choice: (question.sorting
      ? [...Array(question.answers.length).keys()]
      : []) as Array<number>,

    /**
     * The feedback object returned by question.feedback(). Will be set when the
     * Promise returned by question.feedback() resolves.
     */
    feedbackObject: undefined as MultipleChoiceFeedback | undefined,
  })

  const { mode, choice, feedbackObject } = state

  /**
   * SetChoice sets the entire choice array.
   *
   * @param newChoice The new choice array
   */
  function setChoice(newChoice: Array<number>): void {
    setState({
      ...state,
      choice: newChoice,
    })
  }

  /**
   * SetChoiceEntry sets the choice for a single entry.
   *
   * @param key The index of the entry
   * @param value Whether the entry should be chosen
   */
  function setChoiceEntry(key: number, value: boolean): void {
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
    if (mode === "draft") {
      if (question.feedback !== undefined) {
        setState({ ...state, mode: "submitted" })
        void Promise.resolve(question.feedback({ choice })).then(
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
          },
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

      if (!question.sorting) {
        const num = parseInt(kbEvent.key)
        if (!Number.isNaN(num) && num >= 1 && num <= question.answers.length) {
          e.preventDefault()
          const id = num - 1 // answers[num - 1].key
          setChoiceEntry(id, !choice.includes(id))
          return
        }
      }
    },
  })

  if (!question.sorting) {
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
      <InteractWithQuestion
        permalink={permalink}
        name={question.name}
        regenerate={regenerate}
        footerMode={mode}
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
      </InteractWithQuestion>
    )
  } else {
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
    const items: BaseItem[] = []
    for (const position of choice) {
      items.push({
        position,
        element: <Markdown md={question.answers[position]} />,
      })
    }
    const onChange = (newItems: Array<BaseItem>) =>
      setChoice(newItems.map((item) => item.position))

    return (
      <InteractWithQuestion
        permalink={permalink}
        name={question.name}
        regenerate={regenerate}
        footerMode={mode}
        footerMessage={message}
        handleFooterClick={handleClick}
      >
        <Markdown md={question.text ?? ""} />
        <SortableList
          items={items}
          onChange={onChange}
          className="p-5"
          disabled={mode !== "draft"}
        />
      </InteractWithQuestion>
    )
  }
}
