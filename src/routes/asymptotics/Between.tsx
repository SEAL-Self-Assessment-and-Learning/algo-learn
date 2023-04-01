import { ReactNode, useState } from "react"
import { Trans } from "react-i18next"
import math, { getVars } from "../../utils/math"
import TeX from "../../components/TeX"
import {
  mathNodeToSumProductTerm,
  sampleTermSet,
  SumProductTerm,
  TermSetVariants,
  TooComplex,
} from "../../utils/AsymptoticTerm"
import playSound from "../../effects/playSound"
import { QuizQuestion, QuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"
import useGlobalDOMEvents from "../../hooks/useGlobalDOMEvents"
import { QuestionFooter } from "../../components/QuestionFooter"
import { QuestionHeader } from "../../components/QuestionHeader"
import { HorizontallyCenteredDiv } from "../../components/CenteredDivs"

/**
 * Generate and render a question about O/Omega/o/omega
 *
 * @returns {ReactElement} Output
 */
export const Between: QuizQuestion = {
  path: "asymptotics/between",
  title: "asymptotics.between.title",
  description: "asymptotics.between.description",
  variants: ["start", "polylog"],
  examVariants: ["polylog"],
  Component: ({ seed, variant, t, onResult, regenerate }: QuestionProps) => {
    const permalink = Between.path + "/" + variant + "/" + seed
    const random = new Random(seed)
    const [text, setText] = useState("")
    const [savedMode, setMode] = useState(
      "disabled" as "disabled" | "verify" | "correct" | "incorrect"
    )

    const functionName = random.choice("fghFGHT".split(""))
    const variable = random.choice("nmNMxyztk".split(""))
    const [a, b] = sampleTermSet({
      variable,
      numTerms: 2,
      variant: variant as TermSetVariants,
      random,
    })
    let aLandau, bLandau
    if (a.compare(b) < 0) {
      aLandau = "\\omega"
      bLandau = "o"
    } else {
      aLandau = "o"
      bLandau = "\\omega"
    }

    const functionDeclaration = `${functionName}\\colon\\mathbb N\\to\\mathbb R`
    const aTeX = `${aLandau}(${a.toLatex()})`
    const bTeX = `${bLandau}(${b.toLatex()})`

    let parsed: SumProductTerm
    let textFeedback: ReactNode = t("feedback.enter-an-expression")
    let feedbackType: "ok" | "error" = "error"
    if (text) {
      try {
        const expr = math.parse(text)
        const unknownVars = getVars(expr).filter((v) => v !== variable)
        const unknownVar: string | null =
          unknownVars.length > 0 ? unknownVars[0] : null
        if (unknownVar) {
          feedbackType = "error"
          textFeedback = (
            <>
              {t("feedback.unknown-variable")}: <TeX>{unknownVar}</TeX>.<br />
              {t("feedback.expected")}: <TeX>{variable}</TeX>.
            </>
          )
        } else {
          feedbackType = "ok"
          textFeedback = (
            <TeX>
              {expr.toTex({
                parenthesis: "auto",
                implicit: "show",
              })}
            </TeX>
          )
          try {
            parsed = mathNodeToSumProductTerm(expr)
          } catch (e) {
            if (e instanceof TooComplex) {
              textFeedback = t("feedback.too-complex")
              feedbackType = "error"
            } else {
              throw e
            }
          }
        }
      } catch (e) {
        textFeedback = t("feedback.invalid-expression")
        feedbackType = "error"
      }
    }
    const msgColor =
      feedbackType === "error"
        ? "text-red-600 dark:text-red-400"
        : "text-green-600 dark:text-green-400"

    const title = t(Between.title)
    const mode =
      feedbackType === "error"
        ? "disabled"
        : savedMode === "disabled"
        ? "verify"
        : savedMode
    const message =
      mode === "correct" ? (
        <b className="text-2xl">{t("feedback.correct")}</b>
      ) : mode === "incorrect" ? (
        <>
          <b className="text-xl">{t("feedback.possible-correct-solution")}:</b>
          <br />
          TODO
        </>
      ) : null
    function handleClick() {
      if (mode === "disabled") {
        setMode("verify")
      } else if (mode === "verify") {
        if (textFeedback === null || feedbackType === "error") return
        if (
          parsed.compare(a.toSumProductTerm()) *
            parsed.compare(b.toSumProductTerm()) <
          0
        ) {
          playSound("pass")
          setMode("correct")
        } else {
          playSound("fail")
          setMode("incorrect")
        }
      } else if (mode === "correct" || mode === "incorrect") {
        onResult(mode)
      }
    }
    useGlobalDOMEvents({
      keydown(e: Event) {
        const key = (e as KeyboardEvent).key
        if (key === "Enter") {
          e.preventDefault()
          handleClick()
        }
      },
    })
    const condA = `${functionName}(${variable}) \\in ${aTeX}`
    const condB = `${functionName}(${variable}) \\in ${bTeX}`
    return (
      <HorizontallyCenteredDiv>
        <QuestionHeader
          title={title}
          regenerate={regenerate}
          permalink={permalink}
        />
        <Trans t={t} i18nKey="asymptotics.between.text">
          Enter a function <TeX>{{ functionDeclaration } as any}</TeX> that
          satisfies <TeX block>{{ condA } as any}</TeX> and{" "}
          <TeX block>{{ condB } as any}</TeX>
        </Trans>
        <br />
        <br />
        <div className="flex place-items-center gap-2 pl-3">
          <TeX>
            {functionName}({variable})=
          </TeX>
          <input
            autoFocus
            type="text"
            onChange={(e) => {
              setText(e.target.value)
            }}
            value={text}
            className="rounded-md bg-gray-300 p-2 dark:bg-gray-900"
            disabled={mode === "correct" || mode === "incorrect"}
          />
          <div className={`flex h-12 items-center ${msgColor}`}>
            <div>{textFeedback}</div>
          </div>
        </div>
        <div className="p-5 text-slate-600 dark:text-slate-400">
          <Trans t={t} i18nKey="asymptotics.between.note">
            Note: This text field accepts <i>simple</i> mathematical
            expressions, such as
          </Trans>{" "}
          &ldquo;<span className="font-mono">96n^3</span>&rdquo;, &ldquo;
          <span className="font-mono">n log(n)</span>&rdquo;, {t("or")} &ldquo;
          <span className="font-mono">n^(2/3)</span>&rdquo;.
        </div>
        <QuestionFooter
          mode={mode}
          message={message}
          buttonClick={handleClick}
          t={t}
        />
      </HorizontallyCenteredDiv>
    )
  },
}

// const BASE_FUNCTION_TYPES = [
//   "constant",
//   "logarithmic",
//   "linear",
//   "linearithmic",
//   "quadratic",
//   "cubic",
//   "polynomial",
//   "exponential",
// ]

// function generateCloseFunctions(variable = "n", random: Random) {
//   const baseFunctionType = random.weightedChoice([
//     ["logarithmic", 1],
//     ["linear", 1],
//     ["polynomial", 1],
//     ["exponential", 1],
//   ])

//   const lowerOrderModifications: Array<[element: string, weight: number]> = []
//   /*eslint no-fallthrough: ["error", { "commentPattern": "break[\\s\\w]*omitted" }]*/
//   switch (baseFunctionType) {
//     case "exponential":
//       lowerOrderModifications.push(["polynomial", 1])
//       lowerOrderModifications.push(["quadratic", 1])
//       lowerOrderModifications.push(["cubic", 1])
//       lowerOrderModifications.push(["linear", 1])
//     // break omitted
//     case "polynomial":
//     // break omitted
//     case "linear":
//       lowerOrderModifications.push(["logarithmic", 1])
//     // break omitted
//     case "locarithmic":
//       lowerOrderModifications.push(["loglog", 1])
//   }
//   const modificationFunctionType = random.weightedChoice(
//     lowerOrderModifications
//   )

//   const modificationAction = random.weightedChoice([
//     ["multiply", 1],
//     ["divide", 1],
//   ])

//   let function1, function2
//   switch (modificationAction) {
//     case "multiply":
//       function1 = generateBaseFunction(baseFunctionType, variable, random)
//       function2 =
//         generateBaseFunction(baseFunctionType, variable, random) +
//         " * " +
//         generateBaseFunction(modificationFunctionType, variable, random, true)
//       break
//     case "divide":
//       function1 =
//         generateBaseFunction(baseFunctionType, variable, random) +
//         " / " +
//         generateBaseFunction(modificationFunctionType, variable, random, true)
//       function2 = generateBaseFunction(baseFunctionType, variable, random)
//       break
//   }
//   return [function1, function2]
// }

// function generateBaseFunction(
//   functionType: string,
//   variable = "n",
//   random: Random,
//   omitCoefficient = false
// ) {
//   switch (functionType) {
//     case "constant": {
//       const constant = random.int(2, 10)
//       return `${constant}`
//     }
//     case "loglog": {
//       const logBase1 = random.int(2, 5)
//       const logBase2 = random.int(2, 5)
//       return `log_${logBase1}(log_${logBase2}(${variable}))`
//     }
//     case "logarithmic": {
//       const logBase = random.int(2, 5)
//       return `log_${logBase}(${variable})`
//     }
//     case "linear": {
//       if (omitCoefficient) {
//         return variable
//       }
//       const linearCoefficient = random.int(2, 10)
//       return `${linearCoefficient}*${variable}`
//     }
//     case "quadratic": {
//       if (omitCoefficient) {
//         return `${variable}^2`
//       }
//       const quadraticCoefficient = random.int(2, 5)
//       return `${quadraticCoefficient}*${variable}^2`
//     }
//     case "cubic": {
//       if (omitCoefficient) {
//         return `${variable}^3`
//       }
//       const cubicCoefficient = random.int(2, 5)
//       return `${cubicCoefficient}*${variable}^3`
//     }
//     case "polynomial": {
//       const polyCoefficient = random.int(2, 5)
//       const polyExponent = random.int(2, 6)
//       if (omitCoefficient) {
//         return `${polyExponent}^2`
//       }
//       return `${polyCoefficient}*${variable}^${polyExponent}`
//     }
//     case "exponential": {
//       const expBase = random.int(2, 5)
//       return `${expBase}^${variable}`
//     }
//   }
//   return "1"
// }
