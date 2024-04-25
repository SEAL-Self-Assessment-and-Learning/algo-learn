import { useEffect, useState } from "react"
import { FreeTextFeedback, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { InteractWithQuestion, MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"
import { Result } from "@/components/QuestionComponent.tsx"
// import { Input } from "@/components/ui/input"
import useGlobalDOMEvents from "@/hooks/useGlobalDOMEvents.ts"
import { useSound } from "@/hooks/useSound.ts"
import { useTranslation } from "@/hooks/useTranslation.ts"

export function ExerciseMultiTextInput({
  question,
  regenerate,
  onResult,
  permalink,
}: {
  question: MultiFreeTextQuestion
  regenerate?: () => void
  onResult?: (result: Result) => void
  permalink?: string
}) {
  const { playSound } = useSound()
  const { t } = useTranslation()

  question.fillOutAll = question.fillOutAll ? question.fillOutAll : false

  const [state, setState] = useState<{
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }>({
    mode: !question.fillOutAll ? "draft" : "invalid",
    modeID: {},
    text: {},
    formatFeedback: {},
  })

  // clear the modeID of state
  useEffect(() => {
    // This function runs when the component mounts
    setState({
      mode: !question.fillOutAll ? "draft" : "invalid",
      modeID: {},
      text: {},
      formatFeedback: {},
    })
  }, [question.fillOutAll])

  const { mode, text, feedbackObject } = state

  function checkOverallMode(currentModeIDs: { [x: string]: string }) {
    // console.log("currentModeIDs", currentModeIDs)
    if (!question.fillOutAll) return "draft"
    // if every mode in modeID is draft, the overall mode is draft too
    for (const value of Object.values(currentModeIDs)) {
      if (value === "invalid" || value === "initial") {
        return "invalid"
      }
    }
    return "draft"
  }

  function setText(fieldID: string, value: string) {
    setState((state) => ({ ...state, text: { ...state.text, [fieldID]: value } }))
    if (question.checkFormat) {
      void Promise.resolve(question.checkFormat({ text: value }, fieldID)).then(({ valid, message }) => {
        setState({
          ...state,
          text: { ...state.text, [fieldID]: value },
          modeID: {
            ...state.modeID,
            [fieldID]: valid ? "draft" : "invalid",
          },
          formatFeedback: {
            ...state.formatFeedback,
            [fieldID]: !valid ? (message ? message : "") : message ? message : "",
          },
          // call the func providing the modeID, because of the delay in setState
          mode: checkOverallMode({ ...state.modeID, [fieldID]: valid ? "draft" : "invalid" }),
        })
      })
    } else {
      const valid = value.trim().length > 0
      setState({ ...state, text, mode: valid ? "draft" : "invalid" })
    }
  }

  function handleClick() {
    if (mode === "draft") {
      if (question.feedback !== undefined) {
        const userAnswer = JSON.stringify(text)
        void Promise.resolve(question.feedback({ text: userAnswer })).then((feedbackObject) => {
          let mode: MODE = "draft"
          if (feedbackObject.correct === true) {
            playSound("pass")
            mode = "correct"
          } else if (feedbackObject.correct === false) {
            playSound("fail")
            mode = "incorrect"
          }
          setState({ ...state, mode, feedbackObject })
        })
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult && onResult(mode)
    }
  }

  useGlobalDOMEvents({
    keydown(e: Event) {
      if (!(e instanceof KeyboardEvent)) {
        return
      }
      const key = e.key
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
      feedbackObject?.correctAnswer ? (
        <>
          <b className="text-xl">{t("feedback.possible-correct-solution")}:</b>
          <br />
          <Markdown md={feedbackObject.correctAnswer} />
        </>
      ) : (
        <b className="text-2xl">{t("feedback.incorrect")}</b>
      )
    ) : null

  return (
    <InteractWithQuestion
      permalink={permalink}
      name={question.name}
      regenerate={regenerate}
      footerMode={mode}
      footerMessage={message}
      handleFooterClick={handleClick}
    >
      <Markdown md={question.text} setText={setText} state={state} />
    </InteractWithQuestion>
  )
}
