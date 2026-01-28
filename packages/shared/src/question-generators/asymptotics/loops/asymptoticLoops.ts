import type { Parameters as GeneratorParameters } from "../../../api/Parameters.ts"
import {
  minimalMultipleChoiceFeedback,
  type FreeTextFeedbackFunction,
  type FreeTextFormatFunction,
  type FreeTextQuestion,
  type MultipleChoiceQuestion,
  type QuestionGenerator,
} from "../../../api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "../../../api/QuestionRouter.ts"
import math, { getVars } from "../../../utils/math.ts"
import { stringifyPseudoCode } from "../../../utils/pseudoCodeUtils.ts"
import Random from "../../../utils/random.ts"
import { tFunction, tFunctional, type Translations } from "../../../utils/translations.ts"
import { mathNodeToSumProductTerm, sampleTerm, SimpleAsymptoticTerm } from "../asymptoticsUtils.ts"
import type { LoopScenario } from "./asymptoticLoopsHelpers.ts"
import { buildScenarioPool } from "./asymptoticLoopsScenarios.ts"

const translations: Translations = {
  en: {
    name: "Asymptotic Loops",
    description: "Analyze loop-based pseudocode and find its growth rate",
    intro:
      "Consider the following pseudocode for the function `{{0}}(n)`. Assume the primitive statements take constant time.",
    question:
      "What is the tight asymptotic running time of this function? Enter the dominant term (e.g., $n^2$ or $n \\log n$).",
  },
  de: {
    name: "Asymptotische Schleifen",
    description: "Analysiere Schleifen-Pseudocode und bestimme die Wachstumsrate",
    intro:
      "Betrachte den folgenden Pseudocode der Funktion `{{0}}(n)`. Primitive Anweisungen haben konstante Laufzeit.",
    question:
      "Wie lautet die asymptotische Laufzeit dieser Funktion? Gib den dominanten Term an (z. B. $n^2$ oder $n \\log n$).",
  },
}

// Display logs without bases (log_b n ~ log n asymptotically)
const thetaText = (term: SimpleAsymptoticTerm) => `$\\Theta(${term.toLatex(undefined, false, true)})$`

function buildFreeTextQuestion({
  scenario,
  lang,
  parameters,
  seed,
}: {
  scenario: LoopScenario
  lang: keyof typeof translations
  parameters: GeneratorParameters
  seed: string
}): FreeTextQuestion {
  const { t } = tFunction(translations, lang)

  const prompt = "$T(n) = $"

  const checkFormat: FreeTextFormatFunction = ({ text }) => {
    if (text.trim() === "") return { valid: false }
    let mathNode
    try {
      mathNode = math.parse(text)
    } catch {
      return { valid: false, message: "Invalid expression." }
    }
    const unknownVars = getVars(mathNode).filter((v) => v !== scenario.variable)
    const unknownVar = unknownVars.length > 0 ? unknownVars[0] : null
    if (unknownVar) {
      return { valid: false, message: `Unknown variable: ${unknownVar}. Use ${scenario.variable}.` }
    }
    try {
      mathNodeToSumProductTerm(mathNode)
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
    } catch {
      return { valid: false, message: "Incomplete or too complex." }
    }
  }

  const feedback: FreeTextFeedbackFunction = ({ text }) => {
    const userTerm = mathNodeToSumProductTerm(math.parse(text))
    const correctTerm = scenario.complexity.toSumProductTerm()
    const correct = correctTerm.bigTheta(userTerm)
    return {
      correct,
      correctAnswer: `$\\Theta(${scenario.complexity.toLatex(undefined, false, true)})$`,
    }
  }

  return {
    type: "FreeTextQuestion",
    name: t("name"),
    path: serializeGeneratorCall({
      generator: AsymptoticLoops,
      lang,
      parameters,
      seed,
    }),
    text: `${t("intro", [scenario.functionName])}\n\n${stringifyPseudoCode(scenario.code)}\n\n${t("question")}`,
    prompt,
    placeholder: "n log n",
    feedback,
    checkFormat,
  }
}

const makeDistractors = (correct: SimpleAsymptoticTerm, random: Random): SimpleAsymptoticTerm[] => {
  const candidates: SimpleAsymptoticTerm[] = []
  const { variable } = correct

  candidates.push(
    new SimpleAsymptoticTerm({
      variable,
      factorialExponent: correct.factorialExponent,
      polyexponent: correct.polyexponent.add(1),
      logexponent: correct.logexponent,
      loglogexponent: correct.loglogexponent,
    }),
  )

  if (correct.polyexponent.compare(1) > 0) {
    candidates.push(
      new SimpleAsymptoticTerm({
        variable,
        factorialExponent: correct.factorialExponent,
        polyexponent: correct.polyexponent.sub(1),
        logexponent: correct.logexponent,
        loglogexponent: correct.loglogexponent,
      }),
    )
  }

  if (correct.logexponent.compare(0) > 0) {
    candidates.push(
      new SimpleAsymptoticTerm({
        variable,
        factorialExponent: correct.factorialExponent,
        polyexponent: correct.polyexponent,
        logexponent: correct.logexponent.add(1),
        loglogexponent: correct.loglogexponent,
      }),
    )
    candidates.push(
      new SimpleAsymptoticTerm({
        variable,
        factorialExponent: correct.factorialExponent,
        polyexponent: correct.polyexponent,
        logexponent: 0,
        loglogexponent: correct.loglogexponent,
      }),
    )
  } else {
    candidates.push(
      new SimpleAsymptoticTerm({
        variable,
        factorialExponent: correct.factorialExponent,
        polyexponent: correct.polyexponent,
        logexponent: 1,
        loglogexponent: correct.loglogexponent,
      }),
    )
  }

  const unique: SimpleAsymptoticTerm[] = []
  for (const candidate of candidates) {
    if (candidate.compare(correct) !== 0 && !unique.some((u) => u.compare(candidate) === 0)) {
      unique.push(candidate)
    }
  }

  while (unique.length < 3) {
    const fallback = sampleTerm(variable, random.choice(["pure", "polylog"]), random)
    if (fallback.compare(correct) !== 0 && !unique.some((u) => u.compare(fallback) === 0)) {
      unique.push(fallback)
    }
  }

  return unique.slice(0, 3)
}

export const AsymptoticLoops: QuestionGenerator = {
  id: "aloops",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "integer",
      name: "difficulty",
      min: 1,
      max: 7,
    },
  ],
  generate(lang, parameters, seed) {
    const random = new Random(seed)
    const difficultyParam = (parameters?.difficulty as number) ?? 3
    const difficulty = Math.min(Math.max(difficultyParam, 1), 7)
    const safeParameters = { ...parameters, difficulty }

    const pool = buildScenarioPool(difficulty)
    const scenarioFactory = random.choice(pool)
    const scenario = scenarioFactory(random, difficulty)

    const useFreeText = difficulty >= 6 || (difficulty >= 4 && random.bool())

    if (useFreeText) {
      const question = buildFreeTextQuestion({ scenario, lang, parameters: safeParameters, seed })
      return {
        question,
        testing: {
          scenario: scenario.id,
          complexity: scenario.complexity.toLatex(),
          mode: "free",
        },
      }
    }

    const distractors = makeDistractors(scenario.complexity, random)
    const answers = [scenario.complexity, ...distractors].map((term) => ({
      term,
      text: thetaText(term),
    }))
    random.shuffle(answers)

    const correctAnswerIndex = answers
      .map((answer, index) => ({ ...answer, index }))
      .filter((answer) => answer.term.compare(scenario.complexity) === 0)
      .map((answer) => answer.index)

    const { t } = tFunction(translations, lang)
    const text = `${t("intro", [scenario.functionName])}\n\n${stringifyPseudoCode(scenario.code)}\n\n${t("question")}`

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      name: t("name"),
      path: serializeGeneratorCall({
        generator: AsymptoticLoops,
        lang,
        parameters: safeParameters,
        seed,
      }),
      text,
      answers: answers.map((answer) => answer.text),
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex }),
    }

    return {
      question,
      testing: {
        scenario: scenario.id,
        complexity: scenario.complexity.toLatex(),
        mode: "mc",
      },
    }
  },
}
