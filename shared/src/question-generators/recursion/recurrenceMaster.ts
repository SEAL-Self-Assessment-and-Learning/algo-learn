import { validateParameters } from "../../api/Parameters"
import {
  FreeTextFeedbackFunction,
  FreeTextFormatFunction,
  minimalMultipleChoiceFeedback,
  Question,
  QuestionGenerator,
} from "../../api/QuestionGenerator"
import { serializeGeneratorCall } from "../../api/QuestionRouter"
import { format } from "../../utils/format"
import Random from "../../utils/random"
import { tFunction, tFunctional, Translations } from "../../utils/translations"
import {
  sampleMasterRecursion,
  sampleMasterRecursionAnswers,
} from "./formulaUtils"
import { MathNode } from "mathjs"
import math, { getVars } from "../../utils/math"
import { mathNodeToSumProductTerm } from "../asymptotics/asymptoticsUtils"
import { SumProductTerm } from "../asymptotics/asymptoticsUtils"
import Fraction from "fraction.js"
const translations: Translations = {
  en_US: {
    code: "\\[{{0}}\\]",
    description:
      "Look at the following recursive formula {{0}} with a whole number input n:\\[{{1}}\\] where \\[{{2}}\\,.\\]",
    description2: `Use the master theorem to find a closed form of {{0}} in $\\Theta$ notation.`,
    name: "RecurrenceMaster",
    bottomnote:
      "Note: You can assume that n = ${{0}}$ for a k $\\in \\mathbb{N}$ with k>0",
    "feedback.incomplete": "Incomplete or too complex",
    "feedback.unknown-variable": "Unknown variable",
    "feedback.expected": "Expected",
    "feedback.invalid-expression": "invalid formula",
  },
  de_DE: {
    code: "\\[{{0}}\\]",
    description:
      "Betrachte die folgende Rekursionsgleichung {{0}} mit ganzzahliger Eingabe n:\\[{{1}}\\] wobei \\[{{2}}\\,.\\]",
    description2: `Verwenden Sie das Mastertheorem, um für {{0}} eine geschlossene Form in $\\Theta$-Notation zu erhalten.`,
    name: "RecurrenceMaster",
    bottomnote:
      "Note: Sie können davon ausgehen, dass n = ${{0}}$ gilt für ein k $\\in \\mathbb{N}$ mit k>0",
    "feedback.incomplete": "Incomplete or too complex",
    "feedback.unknown-variable": "Unbekannte Variable",
    "feedback.expected": "Erwartet",
    "feedback.invalid-expression": "ungültige Formel",
    "feedback.wrong.case1":
      "Es gilt Fall 1, da f(n) = $\\Oh$(\\[n^log_{b}(a) - \\espilon\\]",
  },
}

export const RecurrenceMaster: QuestionGenerator = {
  path: "recursion/master",
  name: tFunctional(translations, "name"),
  languages: ["en_US", "de_DE"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["choice", "input"],
    },
  ],
  generate(lang, parameters, seed) {
    const permalink = serializeGeneratorCall({
      generator: RecurrenceMaster,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)
    const { t } = tFunction(translations, lang)

    if (!validateParameters(parameters, RecurrenceMaster.expectedParameters)) {
      throw new Error(
        `Unknown variant ${
          parameters.variant
        }. Valid variants are: ${RecurrenceMaster.expectedParameters.join(
          ", "
        )}`
      )
    }

    const variant = parameters.variant as "choice" | "input"
    const { b, a, d, c, solution, masterCase } = sampleMasterRecursion(random)

    const T = random.choice("TABCDEFGHS".split(""))
    const answers = sampleMasterRecursionAnswers({
      random,
      masterCase,
      a,
      b,
      c,
    })
    const text = `
    ${format(t("description"), [
      T,
      `${T}(n) = ${a === 1 ? "" : a} ${T}(n/${b}) + ${c.toLatex("n")}`,
      `${T}(1) = ${d}`,
    ])}
    
    ${format(t("description2"), [`${T}(n)`])}`
    let question: Question
    if (variant === "choice") {
      question = {
        type: "MultipleChoiceQuestion",
        name: t("name"),
        path: permalink,
        text: text,
        answers: answers.map(
          ({ element }) => `${format(t("code"), [element])}`
        ),
        feedback: minimalMultipleChoiceFeedback({
          correctAnswerIndex: answers
            .map((x, i) => ({ ...x, i }))
            .filter((x) => x.correct)
            .map((x) => x.i),
        }),
      }
    } else {
      const prompt = `$\\Theta$ `
      const bottomText = t("bottomnote", [`${b}^k`])
      const checkFormat: FreeTextFormatFunction = ({ text }) => {
        if (text.trim() === "") return { valid: false }
        let mathNode: MathNode
        try {
          mathNode = math.parse(text)
          const unknownVars = getVars(mathNode).filter((v) => v !== "n")
          const unknownVar: string | null =
            unknownVars.length > 0 ? unknownVars[0] : null
          if (unknownVar) {
            return {
              valid: false,
              message: `${t("feedback.unknown-variable")}: $${unknownVar}$. ${t(
                "feedback.expected"
              )}: $${"n"}$.`,
            }
          }
          let sumProductTerm: SumProductTerm
          try {
            sumProductTerm = mathNodeToSumProductTerm(math.parse(text))
            return {
              valid: true,
              message:
                "$" +
                mathNode.toTex({
                  parenthesis: "auto",
                  implicit: "show",
                }) +
                "$",
            }
          } catch (e) {
            return {
              valid: false,
              message: t("feedback.incomplete"),
            }
          }
        } catch (e) {
          return {
            valid: false,
            message: t("feedback.invalid-expression"),
          }
        }
      }

      const feedback: FreeTextFeedbackFunction = ({ text }) => {
        const mathNode: MathNode = math.parse(text)
        solution.coefficient = new Fraction(1)
        const correctAnswer = "$\\Theta(" + solution.toLatex("n") + ")$"
        const sumProductTerm: SumProductTerm = mathNodeToSumProductTerm(
          math.parse(text)
        )

        return {
          correct: solution.Theta(sumProductTerm.dominantTerm()),
          correctAnswer,
        }
      }
      question = {
        type: "FreeTextQuestion",
        path: permalink,
        name: t("name"),
        text,
        prompt,
        bottomText,
        feedback,
        checkFormat,
      }
    }
    return { question }
  },
}
