import { useState } from "react"
import { BiLink, BiRefresh } from "react-icons/bi"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { prefixURL } from "../config"
import { useTranslation } from "../hooks/useTranslation"

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
  const [recentlyCopied, setRecentlyCopied] = useState(false)
  return (
    <h1 className="text-2xl font-bold">
      {title != undefined && title + " "}
      {permalink && (
        <Tooltip placement="right">
          <TooltipTrigger asChild>
            <button
              type="button"
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
          </TooltipTrigger>
          <TooltipContent>
            {(recentlyCopied ? t("copyLinkCopied") : t("copyLinkTooltip")) || ""}
          </TooltipContent>
        </Tooltip>
      )}
      {regenerate && (
        <Tooltip placement="right">
          <TooltipTrigger asChild>
            <button type="button" onClick={regenerate}>
              <BiRefresh className="inline" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{t("generate-new-exercise-of-same-type")}</TooltipContent>
        </Tooltip>
      )}
    </h1>
  )
}
