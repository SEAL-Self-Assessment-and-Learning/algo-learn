import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { Markdown } from "../components/Markdown"
import { useTranslation } from "../hooks/useTranslation"

export function Legal() {
  const { t } = useTranslation()
  return (
    <HorizontallyCenteredDiv className="prose dark:prose-invert">
      <h1>{t("Legal.label")}</h1>
      <p>{t("Legal.text")}</p>
      <p>
        <Markdown md={t("Legal.detailed.text")} />
      </p>
      <h2>{t("Legal.authors.label")}</h2>
      <p>
        <Markdown md={t("Legal.authors.text")} />
      </p>
    </HorizontallyCenteredDiv>
  )
}
