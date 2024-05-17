import { useEffect, useState } from "react"
import { FreeTextFeedback, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { inputRegex } from "@shared/utils/parseMarkdown.ts"
import { InteractWithQuestion, MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"
import { Result } from "@/components/QuestionComponent.tsx"
import { formContext, TextFieldState } from "@/hooks/useFormContext.ts"
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
    window.scrollTo(0, 0)
    // This function runs when the component mounts
    setState({
      ...state,
      mode: !question.fillOutAll ? "draft" : "invalid",
    })
  }, [question.fillOutAll, state])

  const { mode, text, feedbackObject } = state

  function checkOverallMode(currentModeIDs: { [x: string]: string }) {
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
      void Promise.resolve(
        question.checkFormat({ text: { ...state.text, [fieldID]: value } }, fieldID),
      ).then(({ valid, message }) => {
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
        void Promise.resolve(question.feedback({ text })).then((feedbackObject) => {
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

  const fieldValues = getInputFields(question.text ? question.text : "")

  const textFieldStateValues: { [id: string]: TextFieldState } = {}
  for (let i = 0; i < fieldValues.inputIds.length; i++) {

    // first initialize every field in state
    if (!state.text[fieldValues.inputIds[i]]) {
      state.text[fieldValues.inputIds[i]] = ""
      state.modeID[fieldValues.inputIds[i]] = "initial"
      state.formatFeedback[fieldValues.inputIds[i]] = ""
    }

    textFieldStateValues[fieldValues.inputIds[i]] = {
      text: state.text[fieldValues.inputIds[i]],
      align: fieldValues.inputAligns[i],
      prompt: fieldValues.inputPrompts[i],
      feedbackVariation: fieldValues.inputFeedbackVariations[i],
      setText: (text: string) => setText(fieldValues.inputIds[i], text),
      placeholder: fieldValues.inputPlaceholders[i],
      modeID: state.modeID[fieldValues.inputIds[i]],
      feedback: state.formatFeedback[fieldValues.inputIds[i]],
      first: i === 0,
    }
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
      <formContext.Provider value={textFieldStateValues}>
        <Markdown md={question.text} />
      </formContext.Provider>
    </InteractWithQuestion>
  )
}

/**
 * Extracts the input fields from the text.
 * @param text The text to extract the input fields from
 *             Likely to be question.text
 */
function getInputFields(text: string): {
  inputIds: string[]
  inputAligns: string[]
  inputPrompts: string[]
  inputPlaceholders: string[]
  inputFeedbackVariations: string[]
} {
  // add the g flag, because String.prototype.matchAll argument must not be a non-global regular expression
  const regex = new RegExp(inputRegex.source, "g")

  const matches = Array.from(text.matchAll(regex))

  const inputFields: string[] = []

  if (matches.length === 0) {
    return {
      inputIds: [],
      inputAligns: [],
      inputPrompts: [],
      inputPlaceholders: [],
      inputFeedbackVariations: [],
    }
  }

  for (let i = 0; i < matches.length; i++) {
    inputFields.push(matches[i][1])
  }

  return getInputFieldValues(inputFields)
}

/**
 * Extracts the values from the input fields.
 * @param inputFields
 */
function getInputFieldValues(inputFields: string[]): {
  inputIds: string[]
  inputAligns: string[]
  inputPrompts: string[]
  inputPlaceholders: string[]
  inputFeedbackVariations: string[]
} {
  const inputIds: string[] = []
  const inputAligns: string[] = []
  const inputPrompts: string[] = []
  const inputPlaceholders: string[] = []
  const inputFeedbackVariations: string[] = []

  for (const inputField of inputFields) {
    const inputFieldSplit = inputField.split("#")
    inputIds.push(inputFieldSplit[0])
    inputAligns.push(inputFieldSplit[1])
    inputPrompts.push(inputFieldSplit[2])
    inputPlaceholders.push(inputFieldSplit[3])
    inputFeedbackVariations.push(inputFieldSplit[4])
  }

  return { inputIds, inputAligns, inputPrompts, inputPlaceholders, inputFeedbackVariations }
}
