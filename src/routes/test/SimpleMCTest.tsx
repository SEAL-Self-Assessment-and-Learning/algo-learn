import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import TeX from "../../components/TeX"
import Random from "../../utils/random"
import {
  QuestionData,
  QuestionGenerator,
  QuestionParameters,
  QuestionProps,
} from "../../lib/QuestionGenerator"
import {
  Language,
  Translations,
  tFunctional,
  tFunctions,
} from "../../lib/Translations"
import { useTranslation } from "react-i18next"
import { FunctionComponent, useState } from "react"
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
    seedDescription: "Seed for the random number generator",
  },
  de_DE: {
    title: "Summe berechnen",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien {{0}} und {{1}} zwei natürliche Zahlen. Was ist die <3>Summe</3> {{2}}?",
    seedDescription: "Seed für den Zufallsgenerator",
  },
}

/**
 * Generate and render a question about simplifying sums
 *
 * @returns Output
 */
export const SimpleMCTest: QuestionGenerator = {
  path: "asymptotics/sum",
  name: tFunctional(translations, "title"),
  description: tFunctional(translations, "description"),
  tags: ["calculus", "sum"],
  languages: ["en_US", "de_DE"],
  author: "Max Mustermann",
  version: "1.0.0",
  license: "MIT",
  link: "https://example.com",
  allowedParameters: [
    {
      name: "seed",
      type: "string",
      description: (lang: Language) => translations[lang]["seedDescription"],
    },
  ],
  generate: ({ seed }) => {
    const random = new Random(seed)

    const a = random.int(2, 10)
    const b = random.int(2, 10)
    const correctAnswer = a + b
    const answers = [
      { key: "1", correct: true, element: `${correctAnswer}` },
      { key: "2", correct: false, element: `${correctAnswer + 1}` },
      { key: "3", correct: false, element: `${correctAnswer - 1}` },
    ]
    // The type of answers is
    // { key: string, correct: boolean, element: string }[]
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
    return new SimpleMCQuestionData({
      generatedFrom: SimpleMCTest.path,
      parameters: { seed },
      a,
      b,
      answers,
    })
  },
}

class SimpleMCQuestionData extends QuestionData {
  a: number
  b: number
  answers: { key: string; correct: boolean; element: string }[]

  constructor(
    params:
      | {
          generatedFrom: string
          parameters: QuestionParameters
          a: number
          b: number
          answers: { key: string; correct: boolean; element: string }[]
        }
      | string
  ) {
    if (typeof params === "string") {
      params = JSON.parse(params) as SimpleMCQuestionData
    }
    super(params)
    this.a = params.a
    this.b = params.b
    this.answers = params.answers
  }

  toJSON(): string {
    return JSON.stringify(
      {
        generatedFrom: this.generatedFrom,
        a: this.a,
        b: this.b,
        answers: this.answers,
      },
      null,
      2
    ).replace("\\\\", "\\")
  }

  toTex(lang: Language) {
    const { t } = tFunctions(translations, lang)
    return `\\begin{exercise}[${t("title")}]
${t("text", [`$${this.a}$`, `$${this.b}$`, `$${this.a}+${this.b}$`])}
\\begin{itemize}
${this.answers.map(({ element }) => `    \\item $${element}$`).join("\n")}
\\end{itemize}
\\end{exercise}`
  }
  Component: FunctionComponent<QuestionProps> = ({
    permalink,
    lang,
    onResult,
    regenerate,
    viewOnly,
  }) => {
    const { t, Trans } = tFunctions(translations, lang)
    return (
      <ExerciseMultipleChoice
        title={t("title")}
        answers={this.answers}
        regenerate={regenerate}
        allowMultiple={false}
        onResult={onResult}
        permalink={permalink}
        viewOnly={viewOnly}
      >
        <Trans i18nKey="text">
          <TeX>{this.a}</TeX>
          <TeX>{this.b}</TeX>
          <TeX>
            {this.a} + {this.b}
          </TeX>
          <b></b>
        </Trans>
      </ExerciseMultipleChoice>
    )
  }
}

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState("react" as "react" | "latex" | "json")
  const question = SimpleMCTest.generate({ seed })
  const lang = i18n.language === "de" ? "de_DE" : "en_US"
  return (
    <>
      <HorizontallyCenteredDiv className="select-none">
        <input
          type="radio"
          checked={format === "react"}
          onChange={(e) => e.target.checked && setFormat("react")}
          id="react-checkbox"
          className="m-2"
        />
        <label htmlFor="react-checkbox">React</label>
        <input
          type="radio"
          checked={format === "latex"}
          onChange={(e) => e.target.checked && setFormat("latex")}
          id="latex-checkbox"
          className="m-2"
        />
        <label htmlFor="latex-checkbox">LaTeX</label>
        <input
          type="radio"
          checked={format === "json"}
          onChange={(e) => e.target.checked && setFormat("json")}
          id="json-checkbox"
          className="m-2"
        />
        <label htmlFor="json-checkbox">JSON</label>
      </HorizontallyCenteredDiv>
      {format === "react" ? (
        <question.Component key={seed} lang={lang} onResult={() => undefined} />
      ) : (
        <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
          <SyntaxHighlighter
            language={format}
            wrapLongLines
            style={theme === "dark" ? solarizedDark : solarizedLight}
          >
            {format === "latex"
              ? question.toTex(lang)
              : question.toJSON(lang).replace("\\\\", "\\")}
          </SyntaxHighlighter>
        </HorizontallyCenteredDiv>
      )}
    </>
  )
}
