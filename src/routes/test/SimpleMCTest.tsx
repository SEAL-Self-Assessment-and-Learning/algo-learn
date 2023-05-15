import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import Random from "../../utils/random"
import {
  QuestionGenerator,
  QuestionProps,
  Question,
} from "../../lib/QuestionGenerator"
import {
  Language,
  Translations,
  tFunctional,
  tFunctions,
} from "../../lib/Translations"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { HorizontallyCenteredDiv } from "../../components/CenteredDivs"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { useTheme } from "../../hooks/useTheme"

const translations: Translations = {
  en_US: {
    title: "Compute a sum",
    description: "Compute the sum of two integers",
    text: "Let {{0}} and {{1}} be two natural numbers. What is the <3>sum</3> {{2}}?",
  },
  de_DE: {
    title: "Summe berechnen",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien {{0}} und {{1}} zwei natürliche Zahlen. Was ist die <3>Summe</3> {{2}}?",
  },
}

export interface Parameters {
  seed: string
}

/**
 * Generate and render a question about simplifying sums
 *
 * @returns Output
 */
export const SimpleMCTest: QuestionGenerator<Parameters> = {
  path: "asymptotics/sum",
  name: tFunctional(translations, "title"),
  description: tFunctional(translations, "description"),
  tags: ["calculus", "sum"],
  languages: ["en_US", "de_DE"],
  author: "Max Mustermann",
  version: "1.0.0",
  license: "MIT",
  link: "https://example.com",
  generate: ({ seed }: Parameters) => {
    const random = new Random(seed)

    const a = random.int(2, 10)
    const b = random.int(2, 10)
    const correctAnswer = a + b
    const answers = [
      { key: "1", correct: true, element: `${correctAnswer}` },
      { key: "2", correct: false, element: `${correctAnswer + 1}` },
      { key: "3", correct: false, element: `${correctAnswer - 1}` },
    ]
    for (let i = 0; i < 1000; i++) {
      const c = random.int(4, 20)
      if (answers.findIndex((a) => a.element === `${c}`) === -1) {
        answers.push({
          key: "4",
          correct: false,
          element: `${c}`,
        })
        break
      }
    }

    function toTex(lang: Language) {
      const { t } = tFunctions(translations, lang)
      return `\\begin{exercise}[${t("title")}]
  ${t("text", [`$${a}$`, `$${b}$`, `$${a}+${b}$`])}
  \\begin{itemize}
${answers.map(({ element }) => `    \\item $${element}$`).join("\n")}
  \\end{itemize}
\\end{exercise}`
    }
    function Component({
      permalink,
      lang,
      onResult,
      regenerate,
      viewOnly,
    }: QuestionProps) {
      const { t, Trans } = tFunctions(translations, lang)
      return (
        <ExerciseMultipleChoice
          title={t("title")}
          answers={answers}
          regenerate={regenerate}
          allowMultiple={false}
          onResult={onResult}
          permalink={permalink}
          viewOnly={viewOnly}
        >
          <Trans i18nKey="text">
            <TeX>{a}</TeX>
            <TeX>{b}</TeX>
            <TeX>
              {a} + {b}
            </TeX>
            <b></b>
          </Trans>
        </ExerciseMultipleChoice>
      )
    }
    return {
      generatedFrom: SimpleMCTest,
      parameters: { seed },
      toTex,
      Component,
    } as Question<Parameters>
  },
}

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [source, setSource] = useState(false)
  const question = SimpleMCTest.generate({ seed })
  const lang = i18n.language === "de" ? "de_DE" : "en_US"
  return (
    <>
      <HorizontallyCenteredDiv className="select-none">
        <input
          type="checkbox"
          checked={source}
          onChange={(e) => setSource(e.target.checked)}
          id="source-checkbox"
          className="mr-2"
        />
        <label htmlFor="source-checkbox">Show LaTeX source</label>
      </HorizontallyCenteredDiv>
      {source ? (
        <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
          <SyntaxHighlighter
            language="latex"
            wrapLongLines
            style={theme === "dark" ? solarizedDark : solarizedLight}
          >
            {question.toTex(lang)}
          </SyntaxHighlighter>
        </HorizontallyCenteredDiv>
      ) : (
        <question.Component key={seed} lang={lang} onResult={() => undefined} />
      )}
    </>
  )
}
