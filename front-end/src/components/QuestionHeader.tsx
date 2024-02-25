import { useState } from "react"
import { BiLink, BiRefresh } from "react-icons/bi"
import { Tooltip } from "react-tooltip"

import { prefixURL } from "../config"
import { useTranslation } from "../hooks/useTranslation"

import "react-tooltip/dist/react-tooltip.css"

/**
 * QuestionHeader is a header for a question.
 *
 * @param props
 * @param props.title Title of the question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.permalink Permalink to the question.
 */
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
  const idString = permalink ? permalink.replaceAll("/", "-") : ""
  const [recentlyCopied, setRecentlyCopied] = useState(false)
  return (
    <h1 className="text-2xl font-bold">
      {title != undefined && title + " "}
      {permalink && (
        <>
          <button
            type="button"
            id={`copy-link-${idString}`}
            onClick={() => {
              void navigator.clipboard
                .writeText(prefixURL + "/" + permalink)
                .then(() => setRecentlyCopied(true))
            }}
            onMouseLeave={() => {
              setTimeout(() => setRecentlyCopied(false), 200)
            }}
          >
            <BiLink className="inline" />
          </button>
          <Tooltip
            anchorSelect={`#copy-link-${idString}`}
            place="right"
            className="text-sm font-normal"
          >
            {(recentlyCopied ? t("copyLinkCopied") : t("copyLinkTooltip")) ||
              ""}
          </Tooltip>
        </>
      )}
      {regenerate && (
        <>
          <button
            type="button"
            id={`regenerate-${idString}`}
            onClick={regenerate}
          >
            <BiRefresh className="inline" />
          </button>
          <Tooltip
            anchorSelect={`#regenerate-${idString}`}
            place="right"
            className="text-sm font-normal"
          >
            {t("generate-new-exercise-of-same-type")}
          </Tooltip>
        </>
      )}
    </h1>
  )
}
