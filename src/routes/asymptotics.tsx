// Learning goal:
// I can simplify expressions in asymptotic notation
import { TFunction } from "i18next"
import random, { RNGFactory } from "random"
import { FunctionComponent, ReactElement, ReactNode, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useLoaderData, useNavigate } from "react-router-dom"

import math from "../utils/math"

import {
  ExerciseMultipleChoice,
  ExerciseSort,
  QuestionContainer,
  QuestionFooter,
  QuestionHeader,
} from "../components/BasicQuizQuestions"
import TeX from "../components/TeX"
import {
  SimpleAsymptoticTerm,
  mathNodeToSumProductTerm,
  sampleTermSet,
  TermSetVariants,
  TermVariants,
  TooComplex,
  SumProductTerm,
} from "../utils/AsymptoticTerm"
import { playFailSound, playPassSound } from "../utils/audio"
import shuffleArray from "../utils/shuffle"

/**
 * Generate and render a question about simplifying sums
 *
 * @returns {ReactElement} Output
 */
export function SimplifySum({
  seed,
  variant,
  t,
  onResult,
  regeneratable = false,
}: {
  seed: string
  variant: TermSetVariants
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regeneratable?: boolean
}): ReactElement {
  random.use(RNGFactory(seed))

  const functionName = random.choice("fghFGHT".split("")) as string
  const variable = random.choice("nmNMxyztk".split("")) as string
  const sum = sampleTermSet({ variable, numTerms: 4, variant })
  const correctTerm = sum
    .slice()
    .sort((t1, t2) => t1.compare(t2))
    .at(-1)
  const answers = sum.map((term) => ({
    key: term.toLatex(variable, true),
    element: <TeX>\Theta\big({term.toLatex(variable, true)}\big)</TeX>,
    correct: term === correctTerm,
  }))

  const functionDeclaration = `${functionName}\\colon\\mathbb N\\to\\mathbb R`
  const functionDefinition = `${functionName}(${variable})=${sum
    .map((t) => t.toLatex())
    .join(" + ")}`

  return (
    <ExerciseMultipleChoice
      title={t(SimplifySum.title)}
      answers={answers}
      regeneratable={regeneratable}
      allowMultiple={false}
      key={window.location.pathname}
      onResult={onResult}
    >
      <Trans t={t} i18nKey="asymptotics.simplifySum.text">
        F <TeX>{{ functionDeclaration } as any}</TeX> F{" "}
        <TeX block>{{ functionDefinition } as any}</TeX> F
      </Trans>
    </ExerciseMultipleChoice>
  )
}
SimplifySum.variants = ["pure", "polylog", "polylogexp"]
SimplifySum.path = "asymptotics/sum"
SimplifySum.title = "asymptotics.sum.title"

/**
 * Generate and render a question about sorting terms
 *
 * This exercise trains students on the competency of understanding and applying
 * asymptotic notation in the context of analyzing algorithmic time complexity.
 * Specifically, the exercise focuses on the skill of sorting terms in order of
 * their growth rate, which is a key step in analyzing the time complexity of an
 * algorithm.
 *
 * By practicing this skill, students will become more familiar with the
 * different types of asymptotic notation (e.g., big-O, big-omega, big-theta),
 * and they will learn how to identify the dominant term in an expression and
 * compare its growth rate with other terms. This is a foundational skill for
 * analyzing the time complexity of algorithms and designing efficient
 * algorithms.
 *
 * @returns {ReactElement} Output
 */
export function SortTerms({
  seed,
  variant,
  t,
  onResult,
  regeneratable = false,
}: {
  seed: string
  variant: TermSetVariants
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regeneratable?: boolean
}): ReactElement {
  random.use(RNGFactory(seed))

  const variable = random.choice("nmNMxyztk".split(""))

  interface AsymptoticTermWithIndex extends SimpleAsymptoticTerm {
    index: number
    correctIndex: number
  }

  const set = sampleTermSet({
    variable,
    numTerms: 5,
    variant,
  }) as Array<AsymptoticTermWithIndex>
  for (const [i, t] of set.entries()) {
    t.index = i
  }
  const sorted = set.slice().sort((t1, t2) => t1.compare(t2))
  for (const [i, t] of sorted.entries()) {
    t.correctIndex = i
  }

  const answers = set.map((term) => ({
    key: term.toLatex(variable, true),
    index: term.index,
    element: <TeX>{term.toLatex(variable, true)}</TeX>,
    correctIndex: term.correctIndex,
  }))

  return (
    <ExerciseSort
      title={t(SortTerms.title)}
      answers={answers}
      key={window.location.pathname}
      onResult={onResult}
      regeneratable={regeneratable}
    >
      {t("asymptotics.sortTerms.text")}
    </ExerciseSort>
  )
}
SortTerms.variants = ["start", "pure", "polylog", "polylogexp"]
SortTerms.path = "asymptotics/sort"
SortTerms.title = "asymptotics.sort.title"

export function RouteToQuestion({
  Question,
}: {
  Question: FunctionComponent<{
    seed: string
    variant: TermVariants
    t: TFunction
    onResult: (result: "correct" | "incorrect") => void
    regeneratable?: boolean
  }>
}) {
  const { t } = useTranslation()
  const { seed, variant } = useLoaderData() as {
    seed: string
    variant: TermVariants
  }
  const navigate = useNavigate()

  console.assert(seed !== null, "useSeed is null")
  return (
    <Question
      seed={seed}
      variant={variant}
      t={t}
      onResult={() => navigate("/")}
      regeneratable={true}
    />
  )
}

/**
 * Return all variables in a given mathjs expression
 *
 * @param {math.MathNode} node
 * @returns {string[]} Variables
 */
function getVars(node: math.MathNode): Array<string> {
  if (
    (node instanceof math.OperatorNode || node instanceof math.FunctionNode) &&
    node.args instanceof Array
  ) {
    return node.args.flatMap(getVars)
  } else if (node instanceof math.SymbolNode) {
    return [node.name]
  } else if (node instanceof math.ParenthesisNode) {
    return getVars(node.content as math.MathNode)
  } else if (node instanceof math.ConstantNode) {
    return []
  } else {
    throw Error("Unknown node type '" + node.type + "' in getVars")
  }
}

/**
 * Generate and render a question about O/Omega/o/omega
 *
 * @returns {ReactElement} Output
 */
export function Between({
  seed,
  variant,
  t,
  onResult,
  regeneratable = false,
}: {
  seed: string
  variant: TermSetVariants
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regeneratable?: boolean
}): ReactElement {
  random.use(RNGFactory(seed))
  const [text, setText] = useState("")
  const [savedMode, setMode] = useState(
    "disabled" as "disabled" | "verify" | "correct" | "incorrect"
  )

  const functionName = random.choice("fghFGHT".split("")) as string
  const variable = random.choice("nmNMxyztk".split("")) as string
  const [a, b] = sampleTermSet({ variable, numTerms: 2, variant })
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
  let textFeedback: ReactNode = "please enter an expression"
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
            Unknown variable: <TeX>{unknownVar}</TeX>. Expected:{" "}
            <TeX>{variable}</TeX>.
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
            textFeedback = <>Your expression is too complex, try a simpler one!</>
            feedbackType = "error"
          } else {
            throw e
          }
        }
      }
    } catch (e) {
      textFeedback = "unable to parse your expression"
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
      <b className="text-2xl">Correct!</b>
    ) : mode === "incorrect" ? (
      <>
        <b className="text-xl">Possible correct solution:</b>
        <br />
        TODO
      </>
    ) : null
  function handleClick() {
    if (mode === "disabled") {
      setMode("verify")
    } else if (mode === "verify") {
      if (textFeedback === null || feedbackType === "error") return
      if (parsed.compare(a.toSumProductTerm()) * parsed.compare(b.toSumProductTerm()) < 0) {
        playPassSound()
        setMode("correct")
      } else {
        playFailSound()
        setMode("incorrect")
      }
    } else if (mode === "correct" || mode === "incorrect") {
      onResult(mode)
    }
  }
  const condA = `${functionName}(${variable}) \\in ${aTeX}`
  const condB = `${functionName}(${variable}) \\in ${bTeX}`
  return (
    <QuestionContainer>
      <QuestionHeader title={title} regeneratable={regeneratable} />
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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleClick()
          }}
        >
          <input
            type="text"
            onChange={(e) => {
              setText(e.target.value)
            }}
            value={text}
            className="rounded-md bg-gray-300 p-2 dark:bg-gray-900"
            disabled={mode === "correct" || mode === "incorrect"}
          />
        </form>
        <div className={msgColor}>{textFeedback}</div>
      </div>
      <div className="p-5 text-slate-600 dark:text-slate-400">
        <Trans t={t} i18nKey="asymptotics.between.note">
          Note: This text field accepts <i>simple</i> mathematical expressions,
          such as
        </Trans>{" "}
        &ldquo;<span className="font-mono">96n^3</span>&rdquo;, &ldquo;
        <span className="font-mono">n log(n)</span>&rdquo;, {t("or")} &ldquo;
        <span className="font-mono">n^(2/3)</span>&rdquo;.
      </div>
      <QuestionFooter mode={mode} message={message} buttonClick={handleClick} />
    </QuestionContainer>
  )
}
Between.variants = ["start", "polylog"]
Between.path = "asymptotics/between"
Between.title = "asymptotics.between.title"

/**
 * Generate and render a question about asymptotic notation
 *
 * @param {Object} props
 * @param {string} props.seed - Seed for random number generator
 * @param {TFunction} props.t - Translation function
 * @param {(result: "correct" | "incorrect" | "abort") => void} props.onResult
 *   - Callback function
 *
 * @param {boolean} props.regeneratable - Whether the question can be
 *   regenerated
 * @returns {ReactElement} Output
 */
export function LandauNotation({
  seed,
  t,
  onResult,
  regeneratable = false,
}: {
  seed: string
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regeneratable?: boolean
}): ReactElement {
  random.use(RNGFactory(seed))

  const functionTypes = ["\\log n", "n", "n^2", "2^n"]
  const notationTypes = ["o", "O", "\\omega", "\\Theta", "\\Omega"]

  const NUM_QUESTIONS = 8

  // Choose a function and an asymptotic notation type
  const answers = []
  while (answers.length < NUM_QUESTIONS) {
    const variable = random.choice("nmNMxyztk".split("")) as string
    const functionLeft = random.choice(functionTypes) as string
    const functionRight = random.choice(functionTypes) as string
    const notation = random.choice(notationTypes) as string
    const correct =
      functionLeft === functionRight
        ? notation === "\\Theta" || notation === "O" || notation === "\\Omega"
        : functionTypes.findIndex((e) => e === functionLeft) <
          functionTypes.findIndex((e) => e === functionRight)
        ? notation == "o" || notation == "O"
        : notation == "\\omega" || notation == "\\Omega"
    const key = `${functionLeft.replaceAll(
      "n",
      variable
    )} = ${notation}(${functionRight.replaceAll("n", variable)})`
    const element = <TeX>{key}</TeX>

    const isDuplicate = answers.findIndex((e) => e.key === key) >= 0
    const allIncorrect =
      answers.length == NUM_QUESTIONS - 1 &&
      answers.findIndex((e) => e.correct) == -1 &&
      !correct
    if (!isDuplicate && !allIncorrect) {
      answers.push({ key, correct, element })
    }
  }

  shuffleArray(answers)

  return (
    <ExerciseMultipleChoice
      title={t("asymptotics.landau.long-title")}
      answers={answers}
      onResult={onResult}
      key={window.location.pathname}
      regeneratable={regeneratable}
      allowMultiple
    >
      {t("asymptotics.landau.text")}
    </ExerciseMultipleChoice>
  )
}
LandauNotation.path = "asymptotics/landau"
LandauNotation.title = "asymptotics.landau.title"
LandauNotation.variants = ["default"]
