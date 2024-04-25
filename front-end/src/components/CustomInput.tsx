import React, { useState, useRef, useEffect } from "react"
import { FreeTextFeedback } from "@shared/api/QuestionGenerator.ts"
import { MODE } from "@/components/InteractWithQuestion.tsx"
import { Markdown } from "@/components/Markdown.tsx"
import { Input } from "@/components/ui/input"

interface CustomInputProps {
  id: string
  state: {
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }
  setText: (fieldID: string, value: string) => void
}

export const CustomInput: React.FC<CustomInputProps> = ({
  id,
  state,
  setText,
}: {
  id: string
  state: {
    mode: MODE
    modeID: { [key: string]: MODE }
    text: { [key: string]: string }
    feedbackObject?: FreeTextFeedback
    formatFeedback: { [key: string]: string }
  }
  setText: (fieldID: string, value: string) => void
}) => {
  const inputSplit = id.split("#")
  const inputID = inputSplit[0]
  const inputAlign = inputSplit[1]
  const inputPrompt = inputSplit[2]
  const inputPlaceholder = inputSplit[3]
  // case over -> overlay | overlay-perm -> overlay but permanently | below -> no overlay, move other stuff down
  const feedbackVariation: string = inputSplit[4]

  // To select the first created input field on the site
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // check if inputID exists in state
  if (!state.text[inputID]) {
    state.text[inputID] = ""
    state.modeID[inputID] = "initial"
    state.formatFeedback[inputID] = ""
  }

  const inputBorderColor =
    state.modeID[inputID] === "invalid" ? "border-red-500 focus:border-red-500" : ""

  const align: string = "w-full h-full"

  let promptElement
  if (inputPrompt) {
    promptElement = <Markdown md={inputPrompt} />
  }

  let spacing
  if (inputAlign === "NL") {
    spacing = <br />
  }

  const [isInputFocused, setIsInputFocused] = useState(false)

  let inputElement
  if (feedbackVariation === "below") {
    inputElement = (
      <div>
        {spacing}
        <div className="flex flex-col">
          <div className="flex flex-row items-center">
            <div className="mr-2">{promptElement}</div>
            <div className={`${align} relative`}>
              <Input
                ref={Object.keys(state.modeID).length === 1 ? firstInputRef : null}
                key={`newline-input-${inputID}`}
                autoFocus
                disabled={state.mode === "correct" || state.mode === "incorrect"}
                value={state.text[inputID] || ""}
                onChange={(e) => {
                  setText(inputID, e.target.value)
                }}
                type="text"
                className={`${inputBorderColor} focus:outline-none`}
                placeholder={inputPlaceholder || ""}
              />
            </div>
          </div>
          {state.text[inputID] && state.formatFeedback[inputID] && (
            <FeedbackComponent
              inputID={inputID}
              formatFeedback={state.formatFeedback}
              mode={state.modeID}
              type={"below"}
            />
          )}
        </div>
        {spacing}
      </div>
    )
  } else {
    inputElement = (
      <div>
        {spacing}
        <div className="flex flex-row items-center">
          <div className="mr-2">{promptElement}</div>
          <div className={`${align} relative`}>
            <Input
              ref={Object.keys(state.modeID).length === 1 ? firstInputRef : null}
              key={`newline-input-${inputID}`}
              autoFocus
              disabled={state.mode === "correct" || state.mode === "incorrect"}
              value={state.text[inputID] || ""}
              onChange={(e) => {
                setText(inputID, e.target.value)
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(feedbackVariation === "overlay-perm")}
              type="text"
              className={`${inputBorderColor} mb-1 w-full focus:outline-none`}
              placeholder={inputPlaceholder || ""}
            />
            {isInputFocused && state.text[inputID] && state.formatFeedback[inputID] && (
              <FeedbackComponent
                inputID={inputID}
                formatFeedback={state.formatFeedback}
                mode={state.modeID}
                type={"overlay"}
              />
            )}
          </div>
        </div>
        {spacing}
      </div>
    )
  }

  return <>{inputElement}</>
}

const FeedbackComponent = ({
  inputID,
  formatFeedback,
  mode,
  type,
}: {
  inputID: string
  formatFeedback: { [key: string]: string }
  mode: { [key: string]: string }
  type: "overlay" | "below" // overlay means shown below the input field over other components
}) => {
  let feedbackBackgroundColor: string
  let className
  if (type === "below") {
    feedbackBackgroundColor = formatFeedback[inputID]
      ? mode[inputID] === "draft"
        ? "border-l-4 border-green-400"
        : "border-l-4 border-red-400"
      : ""
    className = `mt-2 p-2 ${feedbackBackgroundColor} `
  } else {
    feedbackBackgroundColor = formatFeedback[inputID]
      ? mode[inputID] === "draft"
        ? "bg-green-400"
        : "bg-red-400"
      : ""
    className = `absolute left-0 top-full z-10 ${feedbackBackgroundColor} border border-gray-300 dark:border-gray-700 shadow-md p-2 mt-1 rounded-md`
  }

  // remove text-left to make the feedback align center
  return (
    <div className={`${className} text-left`}>
      {formatFeedback[inputID] && <span>{formatFeedback[inputID]}</span>}
    </div>
  )
}
