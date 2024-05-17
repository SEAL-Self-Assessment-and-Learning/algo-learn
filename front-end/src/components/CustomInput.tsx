import React, { useEffect, useRef, useState } from "react"
import { Markdown } from "@/components/Markdown.tsx"
import { Input } from "@/components/ui/input"
import { useFormContext } from "@/hooks/useFormContext.ts"
import { useTranslation } from "../hooks/useTranslation"

export const CustomInput: React.FC<{ id: string }> = ({ id }: { id: string }) => {
  const useInputContext = useFormContext()

  const inputSplit = id.split("#")
  const inputID = inputSplit[0]

  // case over -> overlay | below -> no overlay, move other stuff down
  const feedbackVariation = useInputContext[inputID].feedbackVariation
  const firstInputField = useInputContext[inputID].first
  const formatFeedback = useInputContext[inputID].feedback
  const inputAlign = useInputContext[inputID].align
  const inputPlaceholder = useInputContext[inputID].placeholder
  const inputPrompt = useInputContext[inputID].prompt
  const modeID = useInputContext[inputID].modeID
  const setText = useInputContext[inputID].setText
  const fieldText = useInputContext[inputID].text

  // To select the first created input field on the site
  const firstInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [inputID])

  const inputBorderColor = modeID === "invalid" ? "border-red-500 focus:border-red-500" : ""

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
  // constantly below the input field
  if (feedbackVariation === "below") {
    inputElement = (
      <div>
        {spacing}
        <div className="flex flex-col">
          <div className="flex flex-row items-center">
            <div className="mr-2">{promptElement}</div>
            <div className={`${align} relative`}>
              <Input
                ref={firstInputField ? firstInputRef : null}
                key={`newline-input-${inputID}`}
                autoFocus
                disabled={modeID === "correct" || modeID === "incorrect"}
                value={fieldText || ""}
                onChange={(e) => {
                  setText ? setText(e.target.value) : ""
                }}
                type="text"
                className={`${inputBorderColor} focus:outline-none`}
                placeholder={inputPlaceholder || ""}
              />
            </div>
          </div>
          <FeedbackComponent
            formatFeedback={formatFeedback ? formatFeedback : ""}
            mode={modeID ? modeID : "draft"}
            type={"below"}
          />
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
              ref={firstInputField ? firstInputRef : null}
              key={`newline-input-${inputID}`}
              autoFocus
              disabled={modeID === "correct" || modeID === "incorrect"}
              value={fieldText || ""}
              onChange={(e) => {
                setText ? setText(e.target.value) : ""
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              type="text"
              className={`${inputBorderColor} mb-1 w-full focus:outline-none`}
              placeholder={inputPlaceholder || ""}
            />
            {isInputFocused && fieldText && formatFeedback && (
              <FeedbackComponent
                formatFeedback={formatFeedback ? formatFeedback : ""}
                mode={modeID ? modeID : "draft"}
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
  formatFeedback,
  mode,
  type,
}: {
  formatFeedback: string
  mode: string
  type: "overlay" | "below" // overlay means shown below the input field over other components
}) => {
  const { t } = useTranslation()

  let feedbackBackgroundColor: string
  let className
  if (type === "below") {
    feedbackBackgroundColor = formatFeedback
      ? mode === "draft"
        ? "border-l-4 border-green-400"
        : "border-l-4 border-red-400"
      : "border-l-4 border-blue-400"
    className = `mt-2 p-2 ${feedbackBackgroundColor} `
    // remove text-left to make the feedback align center
    return (
      <div className={`${className} text-left`}>
        <span>{formatFeedback ? formatFeedback : t("provideFeedbackCheckFormat")}</span>
      </div>
    )
  } else {
    feedbackBackgroundColor = formatFeedback ? (mode === "draft" ? "bg-green-400" : "bg-red-400") : ""
    className = `absolute left-0 top-full z-10 ${feedbackBackgroundColor} border border-gray-300 dark:border-gray-700 shadow-md p-2 mt-1 rounded-md`
    // remove text-left to make the feedback align center
    return (
      <div className={`${className} text-left`}>{formatFeedback && <span>{formatFeedback}</span>}</div>
    )
  }
}

/*
"We will provide feedback to the format of your answer"
*/
