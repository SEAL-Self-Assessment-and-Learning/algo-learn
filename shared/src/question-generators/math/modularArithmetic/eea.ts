import type { Language } from "@shared/api/Language"
import type {
  MultiFreeTextFeedbackFunction,
  MultiFreeTextFormatFunction,
  MultiFreeTextQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Extended Euclidean Algorithm",
    description:
      "Fill in the steps to calculate the GCD of two numbers using the Extended Euclidean Algorithm.",
    eeaQuestion: "Calculate the GCD of ${{a}}$ and ${{b}}$ by completing the following equations:",
    linearCombinationPrompt: "Express the GCD as a linear combination:",
    gcd: "gcd",
    feedbackInvalid: "The input must be an integer.",
  },
  de: {
    name: "Erweiterter Euklidischer Algorithmus",
    description:
      "Fülle die Schritte aus, um den GGT zweier Zahlen mit dem erweiterten euklidischen Algorithmus zu berechnen.",
    eeaQuestion:
      "Berechne den GGT von ${{a}}$ und ${{b}}$ durch das Vervollständigen der folgenden Gleichungen:",
    linearCombinationPrompt: "Drücke den GGT als Linearkombination aus:",
    gcd: "ggt",
    feedbackInvalid: "Die Eingabe muss eine ganze Zahl sein.",
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

    const checkFormat: MultiFreeTextFormatFunction = ({ text }, fieldID) => {
      const input = text[fieldID]?.trim() || ""
      if (input === "") return { valid: false, message: "" }

      if (isNaN(parseInt(input, 10))) {
        return {
          valid: false,
          message: t(translations, lang, "feedbackInvalid"),
        }
      }

      return {
        valid: true,
        message: "",
      }
    }

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      path: permalink,
      name: t(translations, lang, "name"),
      fillOutAll: true,
      text: `${t(translations, lang, "eeaQuestion", { a: String(a), b: String(b) })}\n${table}`,
      feedback: getFeedbackFunction(steps, lang),
      checkFormat,
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
  lang: Language,
): MultiFreeTextFeedbackFunction {
  return ({ text }) => {
    let allStepsCorrect = true

    const feedbackDetails = steps
      .filter((step) => step.quotient !== null) // skip null line
      .map((step, index) => {
        // parse and compare user inputs for each field
        const userQuotient = parseInt(text[`quotient${index}`], 10)
        const userRemainder = parseInt(text[`remainder${index}`], 10)
        const quotientCorrect = userQuotient === step.quotient
        const remainderCorrect = userRemainder === step.remainder

        // exclude checks for filled in fields for the first row
        let dividendCorrect = true
        let divisorCorrect = true
        //  include for subsequent rows
        if (index > 0) {
          const userDividend = parseInt(text[`dividend${index}`], 10)
          const userDivisor = parseInt(text[`divisor${index}`], 10)
          dividendCorrect = userDividend === step.dividend
          divisorCorrect = userDivisor === step.divisor
        }

        // correctness for the steps
        if (!dividendCorrect || !divisorCorrect || !quotientCorrect || !remainderCorrect) {
          allStepsCorrect = false
        }

        return `| ${step.dividend} | $=$ | ${step.quotient} | $\\cdot$ | ${step.divisor} | $+$ | ${step.remainder} |`
      })
      .join("\n")

    const additionalStyling = "|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |\n"

    // check final coefficients for linear combination
    const initialStep = steps[0]
    const a = initialStep.dividend
    const b = initialStep.divisor
    const finalStep = steps[steps.length - 1]
    const gcd = finalStep.remainder

    const userGCD = parseInt(text["gcd"], 10)
    const userCoefA = parseInt(text["coefA"], 10)
    const userCoefB = parseInt(text["coefB"], 10)

    const gcdCorrect = userGCD === gcd
    const coefficientsCorrect =
      (userCoefA === finalStep.s && userCoefB === finalStep.t) ||
      (userCoefA === finalStep.t && userCoefB === finalStep.s)

    // correctness for steps and coefficients
    const isCorrect = allStepsCorrect && gcdCorrect && coefficientsCorrect

    return {
      correct: isCorrect,
      correctAnswer: `${feedbackDetails}${additionalStyling}\n\n$\\text{${t(translations, lang, "gcd")}}(${a}, ${b}) = ${gcd} = ${finalStep.s} \\cdot ${a} + ${finalStep.t} \\cdot ${b}$`,
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
      // first row displays known quantities a and b
      if (index === 0) {
        return `| $ ${step.dividend} $ |$=$| {{quotient${index}#OS-2#}} |$\\cdot$| ${step.divisor} |$+$| {{remainder${index}#OS-2##r_${index + 1}}} |\n`
      }
      if (index === 1) {
        return `| $ ${step.dividend} $ |$=$| {{quotient${index}#OS-2#}} |$\\cdot$| {{divisor${index}#OS-2##r_${index}}} |$+$| {{remainder${index}#OS-2##r_${index + 1}}} |\n`
      }
      return `| {{dividend${index}#OS-2##r_${index}}} |$=$| {{quotient${index}#OS-2#}} |$\\cdot$| {{divisor${index}#OS-2##r_${index}}} |$+$| {{remainder${index}#OS-2##r_${index + 1}}} |\n`
    })

  const calcTable = divisionSteps.join("")

  const linearCombinationPrompt = `\n${t(translations, lang, "linearCombinationPrompt")}\n`
  const gcdRow = `| $\\text{${t(translations, lang, "gcd")}}(${a},${b})$ | $=$ | {{gcd#OS-2#}} | | | |\n`
  const combinationRow = `| | $=$ | {{coefA#OS-2##s}} | $\\cdot$ | ${a} | $+$ | {{coefB#OS-2##t}} | $\\cdot$ | ${b} |\n`
  const additionalStyling = "|#div_my-5?border_none?av_middle?ah_center?table_w-full#| |\n"

  return `${calcTable}${additionalStyling}${linearCombinationPrompt}\n${gcdRow}${combinationRow}${additionalStyling}`
}
