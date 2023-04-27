import { useTranslation, Trans } from "react-i18next"
import { AiFillGithub } from "react-icons/ai"
import { SiDuolingo, SiReact } from "react-icons/si"
import { Link } from "react-router-dom"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"

export function About() {
  const { t, i18n } = useTranslation()

  return (
    <HorizontallyCenteredDiv>
      <h1>{t("About.label")}</h1>
      <p>{t("About.text")}</p>
      <h2 className="mt-5">{t("About.activeLearning.label")}</h2>
      <p>{t("About.activeLearning.text")}</p>
      <h2 className="mt-5">{t("About.spacedRepetition.label")}</h2>
      <p>
        <Trans t={t} i18nKey="About.spacedRepetition.text">
          <Link
            to={`https://${i18n.language}.wikipedia.org/wiki/Spaced_repetition`}
          ></Link>
        </Trans>
      </p>
      <h2 className="mt-5">{t("About.individuallyAdaptive.label")}</h2>
      <p>
        <Trans t={t} i18nKey="About.individuallyAdaptive.text">
          <Link to="https://doi.org/10.18653/v1/p16-1174"></Link>
        </Trans>
      </p>
      <h2 className="mt-5">{t("About.development.label")}</h2>
      <p>
        <Trans t={t} i18nKey="About.development.text">
          <Link to="https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/"></Link>
        </Trans>
      </p>
      <h2 className="mt-5">{t("About.sourceCode.label")}</h2>
      <p>
        <Trans t={t} i18nKey="About.sourceCode.text">
          <Link to="https://reactjs.org/">
            <SiReact className="inline" />
          </Link>
          <a href="https://github.com/holgerdell/algo-learn/">
            <AiFillGithub className="inline" />
          </a>
        </Trans>
      </p>
      <h2 className="mt-5">{t("About.inspiration.label")}</h2>
      <p>
        <Trans t={t} i18nKey="About.inspiration.text">
          <Link to="https://duolingo.com/">
            <SiDuolingo className="inline" />
          </Link>
          <Link to="https://research.duolingo.com/"></Link>
        </Trans>
      </p>{" "}
      <h2 className="mt-5">{t("About.authors.label")}</h2>
      <p>
        <Trans t={t} i18nKey="About.authors.text">
          <Link to="https://holgerdell.com/"></Link>
        </Trans>
      </p>
    </HorizontallyCenteredDiv>
  )
}
