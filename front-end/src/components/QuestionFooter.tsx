import { ReactNode } from "react"
import { GiPlayButton } from "react-icons/gi"
import { SiCheckmarx, SiIfixit } from "react-icons/si"

import { useTranslation } from "../hooks/useTranslation"
import { Button } from "@/components/ui/button"
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
      ? "bg-green-200"
      : mode === "incorrect"
        ? "bg-red-200"
        : "bg-secondary"
  const textColor =
    mode === "correct"
      ? "text-green-900"
      : mode === "incorrect"
        ? "text-red-900"
        : ""
  // const buttonColor =
  //   mode === "correct" || mode === "draft"
  //     ? "green"
  //     : mode === "incorrect"
  //       ? "red"
  //       : "disabled"
  return (
    <div className={`${backgroundColor}`}>
      <div className="m-auto flex max-w-xl flex-col justify-end gap-4 p-5 sm:min-h-[8rem] sm:flex-row sm:justify-between">
        <div
          className={`flex place-items-center self-center text-left ${textColor}`}
        >
          {icon}
          <div>{message}</div>
        </div>
        <Button
          variant={
            mode === "incorrect"
              ? "wrongAnswer"
              : mode === "correct"
                ? "rightAnswer"
                : "default"
          }
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
