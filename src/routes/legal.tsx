import { useTranslation, Trans } from "react-i18next"
import { Link } from "react-router-dom"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"

export function Legal() {
  const { t } = useTranslation()
  return (
    <HorizontallyCenteredDiv>
      <h1>{t("Legal.label")}</h1>
      <p className="my-5">{t("Legal.text")}</p>
      <p className="my-5">
        <Trans t={t} i18nKey="Legal.detailed.text">
          <Link to="https://tcs.uni-frankfurt.de/legal" />
        </Trans>
      </p>
      <h2>{t("Legal.authors.label")}</h2>
      <p>
        <Trans t={t} i18nKey="Legal.authors.text">
          <a href="https://holgerdell.com/"></a>
          <a href="https://github.com/holgerdell/algo-learn/"></a>
        </Trans>
      </p>
    </HorizontallyCenteredDiv>
  )
}
