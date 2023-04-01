import { useState } from "react"
import { useTranslation } from "react-i18next"
import { BiLink, BiRefresh } from "react-icons/bi"
import { prefixURL } from "../config"
import "microtip/microtip.css"

export function QuestionHeader({
  title,
  regenerate,
  permalink,
}: {
  title?: string
  regenerate?: () => void
  permalink?: string
}) {
  const { t } = useTranslation()
  const [recentlyCopied, setRecentlyCopied] = useState(false)
  return (
    <h1>
      {title != undefined && title + " "}
      {permalink && (
        <button
          aria-label={
            (recentlyCopied ? t("copyLinkCopied") : t("copyLinkTooltip")) || ""
          }
          data-microtip-position="right"
          role="tooltip"
        >
          <BiLink
            className="inline"
            onClick={() => {
              void navigator.clipboard
                .writeText(prefixURL + "/" + permalink)
                .then(() => setRecentlyCopied(true))
            }}
            onMouseLeave={() => {
              setTimeout(() => setRecentlyCopied(false), 200)
            }}
          />
        </button>
      )}
      {regenerate && (
        <button
          aria-label={t("generate-new-exercise-of-same-type") || ""}
          data-microtip-position="right"
          role="tooltip"
        >
          <BiRefresh className="inline" onClick={regenerate} />
        </button>
      )}
    </h1>
  )
}
