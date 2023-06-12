import { ReactNode } from "react"
import { GiPlayButton } from "react-icons/gi"
import { SiCheckmarx, SiIfixit } from "react-icons/si"
import { Button } from "./Button"
import { useTranslation } from "../hooks/useTranslation"
import { MODE } from "./InteractWithQuestion"

/**
 * QuestionFooter is the footer of a question. It contains a message and a
 * button.
 *
 * @param props
 * @param props.mode Mode of the footer.
 * @param props.message Message to show.
 * @param props.buttonClick Function to call when the button is clicked.
 */
export function QuestionFooter({
  mode,
  message,
  buttonClick,
}: {
  mode?: MODE
  message?: ReactNode
  buttonClick: () => void
}) {
  const { t } = useTranslation()
  const footerButtonText =
    mode === "correct" || mode === "incorrect" ? (
      <>
        {t("FooterButtonText.Continue")} <GiPlayButton className="inline" />
      </>
    ) : (
      <>{t("FooterButtonText.Check")}</>
    )
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
      : "bg-gray-100 dark:bg-gray-800"
  const textColor =
    mode === "correct"
      ? "text-green-900 dark:text-green-200"
      : mode === "incorrect"
      ? "text-red-900 dark:text-red-100"
      : ""
  const buttonColor =
    mode === "correct" || mode === "draft"
      ? "green"
      : mode === "incorrect"
      ? "red"
      : "disabled"
  return (
    <div className={`bottom-0 left-0 right-0 ${backgroundColor}`}>
      <div className="m-auto flex max-w-xl flex-col justify-end gap-4 p-5 sm:h-48 sm:flex-row sm:justify-between">
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
          disabled={mode === "invalid" || mode === "submitted"}
        >
          {footerButtonText}
        </Button>
      </div>
    </div>
  )
}
