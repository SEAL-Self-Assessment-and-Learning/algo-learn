import { AiFillGithub } from "react-icons/ai"
import { SiDuolingo, SiReact } from "react-icons/si"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { Markdown } from "../components/Markdown"
import { useTranslation } from "../hooks/useTranslation"

export function About() {
  const { t } = useTranslation()

  return (
    <HorizontallyCenteredDiv className="prose dark:prose-invert">
      <h1>{t("About.label")}</h1>
      <p>{t("About.text")}</p>
      <h2>{t("About.activeLearning.label")}</h2>
      <p>{t("About.activeLearning.text")}</p>
      <h2>{t("About.spacedRepetition.label")}</h2>
      <p>
        <Markdown md={t("About.spacedRepetition.text")} />
      </p>
      <h2>{t("About.individuallyAdaptive.label")}</h2>
      <p>
        <Markdown md={t("About.individuallyAdaptive.text")} />
      </p>
      <h2>{t("About.development.label")}</h2>
      <p>
        <Markdown md={t("About.development.text")} />
      </p>
      <h2>{t("About.sourceCode.label")}</h2>
      <p>
        <Markdown md={t("About.sourceCode.text")}>
          <SiReact className="inline" />
          <AiFillGithub className="inline" />
        </Markdown>
      </p>
      <h2>{t("About.inspiration.label")}</h2>
      <p>
        <Markdown md={t("About.inspiration.text")}>
          <SiDuolingo className="inline" />
        </Markdown>
      </p>{" "}
      <h2>{t("About.authors.label")}</h2>
      <p>
        <Markdown md={t("About.authors.text") ?? undefined} />
      </p>
    </HorizontallyCenteredDiv>
  )
}
