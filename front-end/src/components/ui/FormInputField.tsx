import React, { useEffect, useRef, useState } from "react"
import { Markdown } from "@/components/Markdown.tsx"
import { Input } from "@/components/ui/input.tsx"
import { useFormContext } from "@/hooks/useFormContext.ts"
import { useTranslation } from "@/hooks/useTranslation.ts"

export const FormInputField: React.FC<{ id: string }> = ({ id }) => {
  const formContext = useFormContext()

  const {
    feedbackVariation,
    focus,
    feedback,
    type,
    placeholder,
    prompt,
    invalid,
    disabled,
    setText,
    text,
  } = formContext[id]

  // To select the first created input field on the site
  const firstInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (firstInputRef.current && focus) {
      firstInputRef.current.focus({ preventScroll: true })
    }
  }, [id])

  const inputBorderColor = invalid ? "border-red-500 focus:border-red-500" : ""

  let promptElement
  if (prompt) {
    promptElement = <Markdown md={prompt} />
  }

  let spacing
  let inputClasses: string = ""
  if (type === "NL") {
    spacing = <br />
  }
  if (type === "MAT") {
    inputClasses = `w-12 p-2 mx-0.5 focus-visible:ring-1 focus-visible:ring-offset-0`
  } else {
    if (feedbackVariation === "below") {
      inputClasses = "focus:outline-none"
    } else {
      inputClasses = "mb-1 w-full focus:outline-none"
    }
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
            <div className="mr-2 whitespace-nowrap">{promptElement}</div>
            <div className={`relative h-full w-full`}>
              <Input
                ref={focus ? firstInputRef : null}
                key={`newline-input-${id}`}
                disabled={disabled}
                value={text || ""}
                onChange={(e) => {
                  if (setText) {
                    setText(e.target.value)
                  }
                }}
                type="text"
                className={`${inputBorderColor} ${inputClasses} focus:outline-none`}
                placeholder={placeholder || ""}
              />
            </div>
          </div>
          <FeedbackComponent
            formatFeedback={feedback ? feedback : ""}
            invalid={invalid}
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
          <div className={`mr-2 whitespace-nowrap`}>{promptElement}</div>
          <div className={`relative h-full w-full`}>
            <Input
              ref={focus ? firstInputRef : null}
              key={`newline-input-${id}`}
              disabled={disabled}
              value={text || ""}
              onChange={(e) => {
                if (setText) {
                  setText(e.target.value)
                }
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              type="text"
              className={`${inputBorderColor} ${inputClasses} `}
              placeholder={placeholder || ""}
            />
            {isInputFocused && feedback && (
              <FeedbackComponent
                formatFeedback={feedback ? feedback : ""}
                invalid={invalid}
                type={"overlay"}
              />
            )}
          </div>
        </div>
        {spacing}
      </div>
    )
  }

  return inputElement
}

const FeedbackComponent = ({
  formatFeedback,
  invalid,
  type,
}: {
  formatFeedback: string
  invalid: boolean
  type: "overlay" | "below" // overlay means: feedback shown below the input field over other components
}) => {
  const { t } = useTranslation()

  let feedbackBackgroundColor: string
  let className
  if (type === "below") {
    feedbackBackgroundColor = formatFeedback
      ? !invalid
        ? "border-l-4 border-green-400"
        : "border-l-4 border-red-400"
      : "border-l-4 border-blue-400"
    className = `mt-2 p-2 ${feedbackBackgroundColor} `
    // remove text-left to make the feedback align center
    return (
      <div className={`${className} text-left`}>
        <span>
          <Markdown md={formatFeedback ? formatFeedback : t("provideFeedbackCheckFormat")} />
        </span>
      </div>
    )
  } else {
    feedbackBackgroundColor = formatFeedback ? (!invalid ? "bg-green-400" : "bg-red-400") : ""
    className = `absolute left-0 top-full z-10 ${feedbackBackgroundColor} border border-gray-300 dark:border-gray-700 shadow-md p-2 mt-1 rounded-md`
    // remove text-left to make the feedback align center
    return (
      <div className={`${className} text-left`}>
        {formatFeedback && (
          <span>
            <Markdown md={formatFeedback} />
          </span>
        )}
      </div>
    )
  }
}
