import { Trans } from "../../hooks/useTranslation"
import math, { getVars } from "../../utils/math"
import TeX from "../../components/TeX"
import {
  SumProductTerm,
  mathNodeToSumProductTerm,
  ProductTerm,
  createProductTerm,
  sampleFraction,
  IteratedLogarithms,
} from "./asymptoticsUtils"
import { OldQuestionGenerator, OldQuestionProps } from "../../hooks/useSkills"
import Random from "../../utils/random"
import { ExerciseTextInput } from "../../components/ExerciseTextInput"

/** Generate and render a question about O/Omega/o/omega */
export const Between: OldQuestionGenerator = {
  name: "asymptotics/between",
  title: "asymptotics.between.title",
  description: "asymptotics.between.description",
  variants: ["start", "log", "loglog", "nifty"],
  examVariants: ["polylog"],
  Component: ({
    seed,
    variant,
    t,
    onResult,
    regenerate,
    viewOnly,
  }: OldQuestionProps) => {
    const permalink = Between.name + "/" + variant + "/" + seed
    const random = new Random(seed)
    const functionName = random.choice("fghFGHT".split(""))
    const variable = random.choice("nmNMxyztk".split(""))
    const [a, b] = generateBaseFunction(variant, random)

    let aLandau, bLandau
    if (a.compare(b) < 0) {
      aLandau = "\\omega"
      bLandau = "o"
    } else {
      aLandau = "o"
      bLandau = "\\omega"
    }
    let functionDeclaration
    let aTeX, bTeX
    const title = t(Between.title)
    let condA, condB
    let parsed: SumProductTerm
    let condTheta
    if (variant === "nifty") {
      condTheta = `${functionName}(${variable}) \\in ${`${"\\Theta"}(${functionName}(${variable})^2)`}`
    } else {
      functionDeclaration = `${functionName}\\colon\\mathbb N\\to\\mathbb R`
      aTeX = `${aLandau}(${a.toLatex(variable)})`
      bTeX = `${bLandau}(${b.toLatex(variable)})`
      condA = `${functionName}(${variable}) \\in ${aTeX}`
      condB = `${functionName}(${variable}) \\in ${bTeX}`
    }
    let desc
    if (variant !== "nifty") {
      desc = (
        <>
          <Trans t={t} i18nKey="asymptotics.between.text">
            <TeX>{functionDeclaration}</TeX>
            <TeX block>{condA}</TeX>
            <TeX block>{condB}</TeX>
          </Trans>
          <div className="flex place-items-center gap-2 pl-3"></div>
        </>
      )
    } else {
      desc = (
        <>
          <Trans t={t} i18nKey="asymptotics.between.Theta.text">
            <TeX>{functionDeclaration}</TeX>
            <TeX block>{condTheta}</TeX>
          </Trans>
          <div className="flex place-items-center gap-2 pl-3"></div>
        </>
      )
    }

    const prompt = (
      <TeX>
        {functionName}({variable}) ={" "}
      </TeX>
    )

    const bottomNote = (
      <>
        <Trans t={t} i18nKey="asymptotics.between.note">
          Note: This text field accepts <i>simple</i> mathematical expressions,
          such as
        </Trans>{" "}
        &ldquo;<span className="font-mono">96n^3</span>&rdquo;, &ldquo;
        <span className="font-mono">n log(n)</span>&rdquo;, {t("or")} &ldquo;
        <span className="font-mono">n^(2/3)</span>&rdquo;.
      </>
    )
    const feedback = (input: string) => {
      if (input === "")
        return {
          isValid: false,
          isCorrect: false,
          FeedbackText: null,
        }
      try {
        const expr = math.parse(input)
        const unknownVars = getVars(expr).filter((v) => v !== variable)
        const unknownVar: string | null =
          unknownVars.length > 0 ? unknownVars[0] : null
        if (unknownVar) {
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: (
              <>
                {t("feedback.unknown-variable")}: <TeX>{unknownVar}</TeX>.<br />
                {t("feedback.expected")}: <TeX>{variable}</TeX>.
              </>
            ),
          }
        }
        try {
          parsed = mathNodeToSumProductTerm(math.parse(input))
          if (variant === "nifty") {
            return {
              isValid: true,
              isCorrect:
                parsed.getTerms()[0].exponentialBase.n === 1 &&
                parsed.getTerms()[0].exponentialBase.d === 1 &&
                parsed.getTerms()[0].logarithmExponents.size === 0,
              FeedbackText: (
                <TeX>
                  {expr.toTex({
                    parenthesis: "auto",
                    implicit: "show",
                  })}
                </TeX>
              ),
            }
          } else {
            return {
              isValid: true,
              isCorrect: parsed.compare(a) * parsed.compare(b) < 0,
              FeedbackText: (
                <TeX>
                  {expr.toTex({
                    parenthesis: "auto",
                    implicit: "show",
                  })}
                </TeX>
              ),
            }
          }
        } catch (e) {
          return {
            isValid: false,
            isCorrect: false,
            FeedbackText: t("feedback.incomplete"),
          }
        }
      } catch (e) {
        return {
          isValid: false,
          isCorrect: false,
          FeedbackText: t("feedback.invalid-expression"),
        }
      }
    }
    return (
      <ExerciseTextInput
        title={title}
        feedback={feedback}
        onResult={onResult}
        regenerate={regenerate}
        permalink={permalink}
        viewOnly={viewOnly}
        prompt={prompt}
        bottomNote={bottomNote}
      >
        {desc}
      </ExerciseTextInput>
    )
  },
}

export function generateBaseFunction(
  variant: string,
  random: Random
): ProductTerm[] {
  switch (variant) {
    default: {
      return [new ProductTerm(), new ProductTerm()]
    }
    case "start": {
      const a = createProductTerm({
        coefficient: sampleFraction({ fractionProbability: 1 / 3, random }),
        polyexponent: sampleFraction({ fractionProbability: 0, random }),
      })
      const b = createProductTerm({
        coefficient: sampleFraction({ fractionProbability: 1 / 3, random }),
        polyexponent: sampleFraction({ fractionProbability: 0, random }),
      })
      do {
        b.logarithmExponents.get(0).n = random.int(
          a.logarithmExponents.get(0).n - 2,
          a.logarithmExponents.get(0).n + 2
        )
      } while (b.logarithmExponents.get(0).n === a.logarithmExponents.get(0).n)
      return [a, b]
    }
    case "log": {
      const a = createProductTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
          random,
        }),
        polyexponent: sampleFraction({
          fractionProbability: 1 / 3,
          maxInt: 3,
          maxDenominator: 3,
          random,
        }),
        logexponent: sampleFraction({
          fractionProbability: 0,
          minInt: -17,
          maxInt: 17,
          random,
        }),
      })
      const b = createProductTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
          random,
        }),
        polyexponent: sampleFraction({
          fractionProbability: 1 / 3,
          maxInt: 3,
          maxDenominator: 3,
          random,
        }),
        logexponent: sampleFraction({
          fractionProbability: 0,
          minInt: -17,
          maxInt: 17,
          random,
        }),
      })
      a.logarithmExponents.get(1).n = 0
      b.logarithmExponents.get(0).n = a.logarithmExponents.get(0).n
      b.logarithmExponents.get(0).d = a.logarithmExponents.get(0).d
      return random.shuffle([a, b])
    }

    case "loglog": {
      const exponents = new IteratedLogarithms()
      exponents.set(
        2,
        sampleFraction({
          fractionProbability: 0,
          minInt: 2,
          maxInt: 7,
          random,
        })
      )

      const a = new ProductTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
          minInt: 1,
          maxInt: 7,
          random,
        }),
        logarithmExponents: exponents,
      })
      const b = createProductTerm({
        coefficient: sampleFraction({
          fractionProbability: 1 / 3,
          random,
        }),
        logexponent: sampleFraction({
          fractionProbability: 1,
          random,
        }),
      })
      return random.shuffle([a, b])
    }
  }
}
