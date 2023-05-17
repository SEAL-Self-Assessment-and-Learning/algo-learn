import Random from "../../utils/random"
import {
  QuestionGenerator,
  MultipleChoiceQuestion,
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionFeedback,
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
    text: "Let {{0}} and {{1}} be two natural numbers. What is the **sum** {{2}}?",
    seedDescription: "Seed for the random number generator",
  },
  de_DE: {
    title: "Summe berechnen",
    description: "Berechne die Summe zweier Zahlen",
    text: "Seien {{0}} und {{1}} zwei natürliche Zahlen. Was ist die **Summe** {{2}}?",
    seedDescription: "Seed für den Zufallsgenerator",
  },
}

/** This question generator generates a simple multiple choice question. */
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
  generate: ({ seed, lang }) => {
    const random = new Random(seed)

    const a = random.int(2, 10)
    const b = random.int(2, 10)
    const correctAnswer = a + b
    const answers = [
      `$${correctAnswer}$`,
      `$${correctAnswer + 1}$`,
      `$${correctAnswer - 1}$`,
    ]
    for (let i = 0; i < 1000; i++) {
      const c = random.int(4, 20)
      if (answers.findIndex((a) => a === `$${c}$`) === -1) {
        answers.push(`$${c}$`)
        break
      }
    }
    random.shuffle(answers)
    const correctAnswerIndex = answers.findIndex(
      (a) => a === `$${correctAnswer}$`
    )

    const { t } = tFunctions(translations, lang)

    return new SimpleMCQuestion({
      name: SimpleMCTest.name(lang),
      path: SimpleMCTest.path,
      parameters: { seed, lang },
      text: t("text", [`$${a}$`, `$${b}$`, `$${a}+${b}$`]),
      a,
      b,
      answers,
      correctAnswerIndex,
      allowMultipleAnswers: false,
    })
  },
}

interface ISimpleMCQuestion extends MultipleChoiceQuestionData {
  a: number
  b: number
  correctAnswerIndex: number
}

class SimpleMCQuestion extends MultipleChoiceQuestion {
  a: number
  b: number
  correctAnswerIndex: number // index of the correct answer in the answers array

  constructor(props: ISimpleMCQuestion | string) {
    if (typeof props === "string") {
      props = JSON.parse(props) as ISimpleMCQuestion
    }
    super(props)
    this.a = props.a
    this.b = props.b
    this.correctAnswerIndex = props.correctAnswerIndex
  }

  /**
   * The user has answered this question. This function checks the answer and
   * returns feedback, including the correct solution.
   *
   * @param answer The answer(s) of the user
   * @returns Feedback for the user
   */
  feedback = (answer: number[]): MultipleChoiceQuestionFeedback => {
    if (answer.length !== 1) {
      return {
        correct: false,
        correctAnswers: [this.correctAnswerIndex],
        feedbackText: "Please select exactly one answer.",
      }
    }
    if (answer[0] === this.correctAnswerIndex) {
      return {
        correct: true,
        correctAnswers: [this.correctAnswerIndex],
        feedbackText: "Correct!",
      }
    }
    return {
      correct: false,
      correctAnswers: [this.correctAnswerIndex],
      feedbackText: `The correct answer is $${
        this.answers[this.correctAnswerIndex]
      }$.`,
    }
  }
}

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState("react" as "react" | "latex" | "json")
  const lang = i18n.language === "de" ? "de_DE" : "en_US"
  const questionData = SimpleMCTest.generate({ seed, lang })
  const question = new MultipleChoiceQuestion(questionData)
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
        <question.Component key={seed} onResult={() => undefined} />
      ) : (
        <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
          <SyntaxHighlighter
            language={format}
            wrapLongLines
            style={theme === "dark" ? solarizedDark : solarizedLight}
          >
            {format === "latex"
              ? question.toTex()
              : JSON.stringify(question, null, 2).replace("\\\\", "\\")}
          </SyntaxHighlighter>
        </HorizontallyCenteredDiv>
      )}
    </>
  )
}
