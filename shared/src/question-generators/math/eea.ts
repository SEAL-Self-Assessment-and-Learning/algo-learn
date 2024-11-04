import { Language } from "@shared/api/Language"
import {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Extended Euclidean Algorithm",
    description:
      "Fill in the steps to calculate the GCD of two numbers using the Extended Euclidean Algorithm.",
    eeaQuestion: "Calculate the GCD of ${{a}}$ and ${{b}}$ by completing the following equations:",
    linearCombinationPrompt: "Express the GCD as a linear combination:",
    gcd: "gcd",
  },
  de: {
    name: "Erweiterter Euklidischer Algorithmus",
    description:
      "Fülle die Schritte aus, um den GGT zweier Zahlen mit dem erweiterten euklidischen Algorithmus zu berechnen.",
    eeaQuestion:
      "Berechne den GGT von ${{a}}$ und ${{b}}$ durch das Vervollständigen der folgenden Gleichungen:",
    linearCombinationPrompt: "Drücke den GGT als Linearkombination aus:",
    gcd: "ggt",
  },
}

export const ExtendedEuclideanAlgorithm: QuestionGenerator = {
  id: "eea",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["gcd", "extended euclidean algorithm", "eea"],
  languages: ["en", "de"],
  expectedParameters: [{ type: "string", name: "variant", allowedValues: ["default"] }],

  generate: (lang: Language, parameters, seed) => {
    const random = new Random(seed)
    const a = random.int(50, 100)
    const b = random.int(10, 50)
    const { steps } = calculateEEA(a, b)
    const permalink = serializeGeneratorCall({
      generator: ExtendedEuclideanAlgorithm,
      lang,
      parameters,
      seed,
    })

    const table = generateEEATableSteps(a, b, lang, steps)

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      path: permalink,
      name: t(translations, lang, "name"),
      fillOutAll: true,
      text: `${t(translations, lang, "eeaQuestion", { a: String(a), b: String(b) })}\n${table}`,
      feedback: getFeedbackFunction(steps),
    }

    return { question }
  },
}

function getFeedbackFunction(
  steps: Array<{
    dividend: number
    divisor: number | null
    quotient: number | null
    remainder: number
    s: number
    t: number
  }>,
): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    let allStepsCorrect = true

    const feedbackDetails = steps
      .filter((step) => step.quotient !== null) // skip null line
      .map((step, index) => {
        const stepIndex = index + 1

        // parse and compare user inputs for each field
        const userQuotient = parseInt(text[`quotient${stepIndex}`], 10)
        const userRemainder = parseInt(text[`remainder${stepIndex}`], 10)
        const quotientCorrect = userQuotient === step.quotient
        const remainderCorrect = userRemainder === step.remainder

        // exclude checks for filled in fields for the first row
        let dividendCorrect = true
        let divisorCorrect = true
        //  include for subsequent rows
        if (index > 0) {
          const userDividend = parseInt(text[`dividend${stepIndex}`], 10)
          const userDivisor = parseInt(text[`divisor${stepIndex}`], 10)
          dividendCorrect = userDividend === step.dividend
          divisorCorrect = userDivisor === step.divisor
        }

        // correctness for the steps
        if (!dividendCorrect || !divisorCorrect || !quotientCorrect || !remainderCorrect) {
          allStepsCorrect = false
        }

        return `${stepIndex}: $ ${step.dividend} = ${step.quotient} \\cdot  ${step.divisor} + ${step.remainder}$\\n `
      })
      .join("; ")

    // check final coefficients for linear combination
    const initialStep = steps[0]
    const a = initialStep.dividend
    const b = initialStep.divisor
    const finalStep = steps[steps.length - 1]
    const gcd = finalStep.remainder
    const userCoefA = parseInt(text["coefA"], 10)
    const userCoefB = parseInt(text["coefB"], 10)
    const coefficientsCorrect = userCoefA === finalStep.s && userCoefB === finalStep.t

    // correctness for steps and coefficients
    const isCorrect = allStepsCorrect && coefficientsCorrect

    return {
      correct: isCorrect,
      correctAnswer: isCorrect
        ? ""
        : `${feedbackDetails}\\n$ \\text{gcd}(${a}, ${b}) = ${gcd} = ${finalStep.s} \\cdot ${a} + ${finalStep.t} \\cdot ${b} $`,
    }
  }
}

function calculateEEA(a: number, b: number) {
  const steps = []
  let s0 = 1,
    t0 = 0,
    s1 = 0,
    t1 = 1

  while (b !== 0) {
    const quotient = Math.floor(a / b)
    const remainder = a % b
    const sNext = s0 - quotient * s1
    const tNext = t0 - quotient * t1

    steps.push({
      dividend: a,
      divisor: b,
      quotient,
      remainder,
      s: s0,
      t: t0,
    })

    // update for next iteration
    a = b
    b = remainder
    s0 = s1
    t0 = t1
    s1 = sNext
    t1 = tNext
  }

  // gcd is last non-zero remainder (stored invisibly in a)
  const gcd = a

  // push final coefficients
  steps.push({
    dividend: a,
    divisor: null, // no valid divisor
    quotient: null, // no valid quotient
    remainder: gcd, // gcd is remainder in final line
    s: s0,
    t: t0,
  })

  return { gcd, steps }
}

function generateEEATableSteps(
  a: number,
  b: number,
  lang: Language,
  steps: Array<{
    dividend: number
    divisor: number | null
    quotient: number | null
    remainder: number
    s: number
    t: number
  }>,
) {
  const divisionSteps = steps
    .filter((step, index) => index === 0 || step.quotient !== null)
    .map((step, index) => {
      const stepIndex = index + 1

      // first row displays known quantities a and b
      return index === 0
        ? `| $ ${step.dividend} $ |$=$| {{quotient${stepIndex}#TL#}} |$\\cdot$| ${step.divisor} |$+$| {{remainder${stepIndex}#TL#}} |\n`
        : `| {{dividend${stepIndex}#TL#}} |$=$| {{quotient${stepIndex}#TL#}} |$\\cdot$| {{divisor${stepIndex}#TL#}} |$+$| {{remainder${stepIndex}#TL#}} |\n`
    })

  const calcTable = [
    //"\n| **Dividend** |$=$| **Quotient** |$\\cdot$| **Divisor** |$+$| **Remainder** |\n",
    //"|-----------|--|---------|-----|---------|--|-----------|\n",
    ...divisionSteps,
  ].join("")

  const linearCombinationPrompt = `\n${t(translations, lang, "linearCombinationPrompt")}\n`
  const finalRow = `| $\\text{${t(translations, lang, "gcd")}}(${a},${b})$ |$=$| {{gcd#TL#}} |$=$| {{coefA#TL#}} |$\\cdot$| ${a} |$+$| {{coefB#TL#}} |$\\cdot$| ${b} |\n`
  const additionalStyling = "|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |\n"

  return `${calcTable}${additionalStyling}${linearCombinationPrompt}\n|---|---|---|---|---|---|---|\n${finalRow}${additionalStyling}`
}
