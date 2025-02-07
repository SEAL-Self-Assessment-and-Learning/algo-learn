import React, { useEffect, useRef, useState, type ReactElement } from "react"
import { Markdown } from "@/components/Markdown.tsx"
import { Input } from "@/components/ui/input.tsx"
import { useFormField } from "@/hooks/useFormContext.ts"
import { useTranslation } from "@/hooks/useTranslation.ts"

export const FormInputField: React.FC<{ id: string }> = ({ id }) => {
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
  } = useFormField(id)

  // To select the first created input field on the site
  const firstInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (firstInputRef.current && focus) {
      firstInputRef.current.focus({ preventScroll: true })
    }
  }, [id])

  const inputBorderColor = invalid ? "border-red-500 focus:border-red-500" : ""

  let promptElement: ReactElement = <></>
  if (prompt) {
    promptElement = (
      <div className={`${prompt ? "mr-2 whitespace-nowrap" : ""}`}>
        <Markdown md={prompt} />
      </div>
    )
  }

  let spacing
  let additionalClasses: string
  let fieldWidth: number | null = null
  if (feedbackVariation === "below") {
    additionalClasses = "focus:outline-none"
  } else {
    additionalClasses = "w-full focus:outline-none"
  }
  if (type === "NL") {
    spacing = <br />
  } else if (type.startsWith("OS")) {
    fieldWidth = Number.parseInt(type.slice(3)) * 3
  }
  if (type === "MAT") {
    additionalClasses = `w-12 p-2 mx-0.5 focus-visible:ring-1 focus-visible:ring-offset-0`
  }

  const feedbackElement: ReactElement = (
    <FeedbackComponent
      formatFeedback={feedback ? feedback : ""}
      invalid={invalid}
      type={feedbackVariation === "below" ? "below" : "overlay"}
    />
  )

  const [isInputFocused, setIsInputFocused] = useState(false)
  let inputElement
  // constantly below the input field
  if (feedbackVariation === "below") {
    inputElement = (
      <div>
        {spacing}
        <div className="flex flex-col">
          <div className="flex flex-row items-center">
            {promptElement}
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
                className={`${inputBorderColor} ${additionalClasses} focus:outline-none`}
                style={fieldWidth ? { width: `${fieldWidth}ch` } : {}}
                placeholder={placeholder || ""}
              />
            </div>
          </div>
          {feedbackElement}
        </div>
        {spacing}
      </div>
    )
  } else {
    inputElement = (
      <div>
        {spacing}
        <div className="flex flex-row items-center">
          {promptElement}
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
              className={`${inputBorderColor} ${additionalClasses} `}
              style={fieldWidth ? { width: `${fieldWidth}ch` } : {}}
              placeholder={placeholder || ""}
            />
            {isInputFocused && feedback && feedbackElement}
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
    className = `mt-1 absolute left-0 top-full z-10 ${feedbackBackgroundColor} border border-gray-300 dark:border-gray-700 shadow-md p-2 mt-1 rounded-md`
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
