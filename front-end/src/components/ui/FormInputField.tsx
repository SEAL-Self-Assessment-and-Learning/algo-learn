import React, { useEffect, useRef, useState, type ReactElement } from "react"
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setText) {
      if (type === "TTABLE" && e.target.value !== "0" && e.target.value !== "1") {
        setText("")
      } else {
        setText(e.target.value)
      }
    }
  }

  const inputBorderColor = invalid ? "border-red-500 focus:border-red-500" : ""

  let promptElement: ReactElement = <></>
  if (prompt) {
    promptElement = (
      <div className={`${prompt ? "mr-2 whitespace-nowrap" : ""}`}>
        <Markdown md={prompt} />
      </div>
    )
  }

  const { spacing, additionalClassnames, fieldWidth } = getExtraStyles(type, feedbackVariation)

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
            <div className={`relative flex h-full w-full items-center justify-center`}>
              <Input
                ref={focus ? firstInputRef : null}
                key={`newline-input-${id}`}
                disabled={disabled}
                value={text || ""}
                onChange={handleChange}
                maxLength={type === "TTABLE" ? 1 : undefined}
                type="text"
                className={`${inputBorderColor} ${additionalClassnames} focus:outline-none`}
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
          <div className={`relative flex h-full w-full items-center justify-center`}>
            <Input
              ref={focus ? firstInputRef : null}
              key={`newline-input-${id}`}
              disabled={disabled}
              value={text || ""}
              onChange={handleChange}
              maxLength={type === "TTABLE" ? 1 : undefined}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              type="text"
              className={`${inputBorderColor} ${additionalClassnames} `}
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
    className = `absolute left-0 top-full z-10 ${feedbackBackgroundColor} border border-gray-300 dark:border-gray-700 shadow-md p-2 mt-2 rounded-md`
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

/**
 * Function to extract extra styles depending on passed arguments for the input field
 * @param style - passed style option
 * @param feedbackVariation -
 */
function getExtraStyles(style: string, feedbackVariation: string) {
  let spacing
  let additionalClassnames: string = ""
  let fieldWidth: number | null = null

  if (style === "NL") {
    spacing = <br />
  } else if (style === "TTABLE") {
    additionalClassnames =
      "focus:outline-none w-10 py-0.5 px-1 h-8 mx-0.5 my-0.5 focus-visible:ring-1 focus-visible:ring-offset-0 text-center"
  } else if (style === "MAT") {
    additionalClassnames = `w-12 p-2 mx-0.5 focus-visible:ring-1 focus-visible:ring-offset-0`
  }
  if (additionalClassnames === "") {
    if (feedbackVariation === "below") {
      additionalClassnames = "focus:outline-none"
    } else {
      additionalClassnames = "mb-1 w-full focus:outline-none"
    }
  } else if (style.startsWith("OS")) {
    fieldWidth = Number.parseInt(style.slice(3)) * 3
  }
  return { spacing, additionalClassnames, fieldWidth }
}
