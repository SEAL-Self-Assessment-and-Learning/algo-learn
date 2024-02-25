import { AiFillGithub } from "react-icons/ai"
import { SiDuolingo, SiReact } from "react-icons/si"

import { format } from "../../../shared/src/utils/format"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { Markdown } from "../components/Markdown"
import { useTranslation } from "../hooks/useTranslation"

export function About() {
  const { t, lang } = useTranslation()

  return (
    <HorizontallyCenteredDiv className="prose">
      <h1>{t("About.label")}</h1>
      <p>{t("About.text")}</p>
      <h2>{t("About.activeLearning.label")}</h2>
      <p>{t("About.activeLearning.text")}</p>
      <h2>{t("About.spacedRepetition.label")}</h2>
      <p>
        <Markdown
          md={format(t("About.spacedRepetition.text"), [
            `https://${lang}.wikipedia.org/wiki/Spaced_repetition`,
          ])}
        />
      </p>
      <h2>{t("About.individuallyAdaptive.label")}</h2>
      <p>
        <Markdown
          md={format(t("About.individuallyAdaptive.text"), [
            "https://doi.org/10.18653/v1/p16-1174",
          ])}
        />
      </p>
      <h2>{t("About.development.label")}</h2>
      <p>
        <Markdown
          md={format(t("About.development.text"), [
            "https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/",
          ])}
        />
      </p>
      <h2>{t("About.sourceCode.label")}</h2>
      <p>
        <Markdown md={t("About.sourceCode.text")}>
          <SiReact className="inline" />
          {"https://reactjs.org/"}
          <AiFillGithub className="inline" />
          {"https://github.com/goethe-tcs/algo-learn/"}
        </Markdown>
      </p>
      <h2>{t("About.inspiration.label")}</h2>
      <p>
        <Markdown md={t("About.inspiration.text")}>
          <SiDuolingo className="inline" />
          {"https://duolingo.com/"}
          {"https://research.duolingo.com/"}
        </Markdown>
      </p>{" "}
      <h2>{t("About.authors.label")}</h2>
      <p>
        <Markdown md={t("About.authors.text") ?? undefined} />
      </p>
    </HorizontallyCenteredDiv>
  )
}
