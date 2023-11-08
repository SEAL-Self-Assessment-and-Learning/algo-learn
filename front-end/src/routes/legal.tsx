import { format } from "../../../shared/src/utils/format"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { Markdown } from "../components/Markdown"
import { useTranslation } from "../hooks/useTranslation"

export function Legal() {
  const { t } = useTranslation()
  return (
    <HorizontallyCenteredDiv>
      <h1>{t("Legal.label")}</h1>
      <p className="my-5">{t("Legal.text")}</p>
      <p className="my-5">
        <Markdown
          md={format(t("Legal.detailed.text"), [
            "https://tcs.uni-frankfurt.de/legal",
          ])}
        />
      </p>
      <h2>{t("Legal.authors.label")}</h2>
      <p>
        <Markdown
          md={format(t("Legal.authors.text"), [
            "https://holgerdell.com/",
            "https://github.com/goethe-tcs/algo-learn/",
          ])}
        />
      </p>
    </HorizontallyCenteredDiv>
  )
}
