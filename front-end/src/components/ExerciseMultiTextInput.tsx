import { useMemo, useState } from "react"
import { FreeTextFeedback, MultiFreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { inputRegex } from "@shared/utils/parseMarkdown.ts"
import { InteractWithQuestion, MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"
import { Result } from "@/components/QuestionComponent.tsx"
import { formContext, TextFieldState } from "@/hooks/useFormContext.ts"
import useGlobalDOMEvents from "@/hooks/useGlobalDOMEvents.ts"
import { useSound } from "@/hooks/useSound.ts"
import { useTranslation } from "@/hooks/useTranslation.ts"
import { isMobileOrTablet } from "@/utils/deviceInformation.ts"

/**
 * This component is used to create a question with multiple input fields
 *
 * The input fields are defined in the Markdown text using the following syntax:
 * {{id#align#promt#placeholder#checkformat}}
 * - id: a unique identifier for the input field
 * - align: the alignment of the input field
 *          NL: new line (places a line break before and after the input field)
 *          -: default (no linebreaks)
 * - prompt: text displayed before the input field
 * - placeholder: the placeholder text inside the input field
 * - checkFormat: determines how feedback on the format of the userinput is displayed
 *               - below: displays feedback in a div anchored below the input field
 *               -: displays feedback in an overlaid div (appearing over other components),
 *                  shown only when the input field is focused.
 *
 * @param question
 * @param regenerate
 * @param onResult
 * @param permalink
 * @constructor
 */
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
      setState({
        ...state,
        text: { ...state.text, [fieldID]: value },
        mode: valid ? "draft" : "invalid",
      })
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
      if (onResult) onResult(mode)
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

  const message = []
  if (mode === "correct") {
    message.push(<b className="text-2xl">{t("feedback.correct")}</b>)
  } else if (mode === "incorrect") {
    if (feedbackObject?.feedbackText) {
      message.push(
        <>
          <Markdown md={feedbackObject.feedbackText} />
          <br />
        </>,
      )
    }
    if (feedbackObject?.correctAnswer) {
      message.push(
        <>
          <b className="text-xl">{t("feedback.possible-correct-solution")}:</b>
          <br />
          <Markdown md={feedbackObject.correctAnswer} />
        </>,
      )
    } else {
      message.push(<b className="text-2xl">{t("feedback.incorrect")}</b>)
    }
  }

  const fieldValues = getInputFields(question.text ? question.text : "")

  const textFieldStateValues = useMemo(() => {
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
        invalid: state.modeID[fieldValues.inputIds[i]] === "invalid",
        disabled: mode === "correct" || mode === "incorrect",
        feedback: state.formatFeedback[fieldValues.inputIds[i]],
        focus: i === 0 && !isMobileOrTablet,
      }
    }
    return textFieldStateValues
  }, [fieldValues, state.text, state.modeID, state.formatFeedback, mode])

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
