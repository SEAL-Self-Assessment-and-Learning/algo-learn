// An abstraction for basic quiz questions. Each question has:
// - question text,
// - a list of possible answers
//
// Current features:
// - Multiple choice questions
// - Drag-and-drop sorting questions

import "microtip/microtip.css"
import { ChangeEvent, ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { BiLink, BiRefresh } from "react-icons/bi"
import { GiPlayButton } from "react-icons/gi"
import { SiCheckmarx, SiIfixit } from "react-icons/si"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import playSound from "../effects/playSound"
import { AnswerBox } from "./AnswerBox"
import { Button } from "./Button"
import { SortableList } from "./SortableList"
import { prefixURL } from "../index"
import { t } from "i18next"

/**
 * A container for questions.
 *
 * @example
 *   ;<ExerciseContainer>
 *     <ExerciseTitle title="Exercise 1" />
 *     <p>Question text</p>
 *     <ExerciseMultipleChoice>
 *       <AnswerRadio id="a1">Answer 1</AnswerRadio>
 *       <AnswerRadio id="a2">Answer 2</AnswerRadio>
 *       <AnswerRadio id="a3">Answer 3</AnswerRadio>
 *     </ExerciseMultipleChoice>
 *   </ExerciseContainer>
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.className
 * @returns {React.ReactElement}
 */
export function QuestionContainer(
  props: React.HTMLAttributes<HTMLDivElement>
): React.ReactElement {
  return (
    <div
      {...props}
      className={`mx-auto mt-5 block max-w-xl ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  )
}

export function QuestionHeader({
  title,
  regenerate,
  permalink,
}: {
  title?: string
  regenerate?: () => void
  permalink?: string
}) {
  const { t } = useTranslation()
  const [recentlyCopied, setRecentlyCopied] = useState(false)
  return (
    <h1>
      {title != undefined && title + " "}
      {permalink && (
        <button
          aria-label={
            (recentlyCopied ? t("copyLinkCopied") : t("copyLinkTooltip")) || ""
          }
          data-microtip-position="right"
          role="tooltip"
        >
          <BiLink
            className="inline"
            onClick={() => {
              void navigator.clipboard
                .writeText(prefixURL + "/" + permalink)
                .then(() => setRecentlyCopied(true))
            }}
            onMouseLeave={() => {
              setTimeout(() => setRecentlyCopied(false), 200)
            }}
          />
        </button>
      )}
      {regenerate && (
        <button
          aria-label={t("generate-new-exercise-of-same-type") || ""}
          data-microtip-position="right"
          role="tooltip"
        >
          <BiRefresh className="inline" onClick={regenerate} />
        </button>
      )}
    </h1>
  )
}

export function AnswerRadio({
  id,
  onChange,
  children,
}: {
  id: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  children: ReactNode
}) {
  return (
    <div className="flex place-items-center">
      <input type="radio" id={id} className="peer hidden" onChange={onChange} />
      <AnswerBox TagName="label" htmlFor={id} includePeerCheckedStyle>
        {children}
      </AnswerBox>
    </div>
  )
}

export function FooterButtonText({
  mode,
}: {
  mode: "correct" | "incorrect" | "disabled" | "verify"
}) {
  return mode === "correct" || mode === "incorrect" ? (
    <>
      {t("FooterButtonText.Continue")} <GiPlayButton className="inline" />
    </>
  ) : (
    <>{t("FooterButtonText.Check")}</>
  )
}

export function QuestionFooter({
  mode = "disabled",
  message,
  buttonClick,
}: {
  mode?: "correct" | "incorrect" | "disabled" | "verify"
  message?: ReactNode
  buttonClick: () => void
}) {
  const icon =
    mode === "correct" ? (
      <SiCheckmarx className="mr-5 inline-block text-7xl" />
    ) : mode === "incorrect" ? (
      <SiIfixit className="mr-5 inline-block text-6xl" />
    ) : null
  const backgroundColor =
    mode === "correct"
      ? "bg-green-200 dark:bg-green-700"
      : mode === "incorrect"
      ? "bg-red-200 dark:bg-red-700"
      : ""
  const textColor =
    mode === "correct"
      ? "text-green-900 dark:text-green-200"
      : mode === "incorrect"
      ? "text-red-900 dark:text-red-100"
      : ""
  const buttonColor =
    mode === "correct" || mode === "verify"
      ? "green"
      : mode === "incorrect"
      ? "red"
      : "disabled"
  return (
    <div className={`absolute bottom-0 left-0 right-0 ${backgroundColor}`}>
      <div className="m-auto flex justify-end sm:h-48 max-w-xl flex-col sm:justify-between gap-4 p-5 sm:flex-row">
        <div
          className={`flex place-items-center self-center text-left ${textColor}`}
        >
          {icon}
          <div>{message}</div>
        </div>
        <Button
          color={buttonColor}
          onClick={buttonClick}
          className="self-end sm:self-center"
        >
          <FooterButtonText mode={mode} />
        </Button>
      </div>
    </div>
  )
}

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
    <QuestionContainer>
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
      <QuestionFooter mode={mode} message={message} buttonClick={handleClick} />
    </QuestionContainer>
  )
}

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
    <QuestionContainer>
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
      <QuestionFooter mode={mode} message={message} buttonClick={handleClick} />
    </QuestionContainer>
  )
}
