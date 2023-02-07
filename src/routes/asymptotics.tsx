// Learning goal:
// I can simplify expressions in asymptotic notation
import { TFunction } from "i18next"
import { all, create, log2, MathNode } from "mathjs"
import random, { RNGFactory } from "random"
import { FunctionComponent, ReactElement, ReactNode, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useLoaderData, useNavigate } from "react-router-dom"

const math = create(all)

import nerdamer from "nerdamer"

import "nerdamer/Algebra.js"
import "nerdamer/Calculus.js"
// import "nerdamer/Solve.js"

import {
  ExerciseMultipleChoice,
  ExerciseSort,
  QuestionContainer,
  QuestionFooter,
  QuestionHeader,
} from "../components/BasicQuizQuestions"
import TeX from "../components/TeX"
import {
  AsymptoticTerm,
  sampleTermSet,
  TermSetVariants,
  TermVariants,
} from "../utils/AsymptoticTerm"
import { playPassSound } from "../utils/audio"
import shuffleArray from "../utils/shuffle"

/**
 * Generate and render a question about simplifying sums
 * @returns {ReactElement} output
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
    key: term.toLatex(true),
    element: <TeX>\Theta\big({term.toLatex(true)}\big)</TeX>,
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
 * @returns {ReactElement} output
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

  interface AsymptoticTermWithIndex extends AsymptoticTerm {
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
    key: term.toLatex(true),
    index: term.index,
    element: <TeX>{term.toLatex(true)}</TeX>,
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

// const customFunctions = {
//   log: function (a) {
//     return log2(a)
//   },
// }
// customFunctions.log.toTex = "\\mathrm{${name}}\\left(${args}\\right)" //template string
math.log = log2
math.log.toTex = "\\mathrm{${name}}\\left(${args}\\right)" //template string
// math.import(customFunctions)
delete math.Unit // remove units
console.log(math)

function customLaTeX(node, options) {
  // if (node.type === "FunctionNode" && node.name === "log") {
  //   return "\\log({" + node.args[0].toTex(options) + "})"
  // }
}

/**
 * Return all variables in a given mathjs expression
 * @param {MathNode} node
 * @returns {Array<string>} variables
 */
function getVars(node: MathNode): Array<string> {
  if (
    (node instanceof math.OperatorNode || node instanceof math.FunctionNode) &&
    node.args instanceof Array
  ) {
    return node.args.flatMap(getVars)
  } else if (node instanceof math.SymbolNode) {
    return [node.name]
  } else if (node instanceof math.ParenthesisNode) {
    return getVars(node.content as MathNode)
  } else if (node instanceof math.ConstantNode) {
    return []
  } else {
    throw Error("Unknown node type '" + node.type + "' in getVars")
  }
}

function parseAsAsymptoticTerm(node: MathNode): AsymptoticTerm {
  const simpleNode = math.simplify(node)
  if (node instanceof math.OperatorNode && node.args instanceof Array) {
    const args = node.args.map(parseAsAsymptoticTerm)
  } else if (node instanceof math.SymbolNode) {
    return [node.name]
  } else if (node instanceof math.ParenthesisNode) {
    return getVars(node.content as MathNode)
  } else {
    return []
  }
}

/**
 * Generate and render a question about O/Omega/o/omega
 * @returns {ReactElement} output
 */
export function RelateToSum({
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
  const [a, b] = sampleTermSet({ variable, numTerms: 2, variant: "polylog" })
  let aLandau, bLandau
  if (a.compare(b) < 0) {
    aLandau = "\\omega"
    bLandau = "o"
  } else {
    aLandau = "o"
    bLandau = "\\omega"
  }

  const landaus = shuffleArray(["\\omega", "\\Theta", "o"])
  // const correctLandau = c == sorted[0] || c == sorted[1] ? "\\omega" : "o"
  const answers = landaus.map((landau) => ({
    key: landau,
    element: (
      <TeX>
        {landau}\big({a.toLatex(true)}\big)
      </TeX>
    ),
    correct: true,
  }))

  const functionDeclaration = `${functionName}\\colon\\mathbb N\\to\\mathbb R`
  const aTeX = `${aLandau}(${a.toLatex()})`
  const bTeX = `${bLandau}(${b.toLatex()})`

  let testOutput
  let textFeedback: ReactNode = "please enter an expression"
  let feedbackType: "ok" | "error" = "error"
  if (text) {
    try {
      const expr = math.parse(text)
      console.log(math.simplify(expr))
      // testTex = math.simplify(math.derivative(expr, "x")).toTex({
      //   parenthesis: "auto",
      //   handler: customLaTeX,
      //   implicit: "show",
      // })
      // const expr = nerdamer(text)
      console.log("Your expression:", expr)
      // const unknownVar = expr.variables().find((v) => v !== variable)
      const unknownVarsss = expr
        .filter(
          (node) =>
            node.isSymbolNode &&
            !node.isFunctionNode &&
            node.name !== variable &&
            node.name !== "log"
        )
        .map((node) => node.name as string)
      const unknownVars = getVars(expr).filter((v) => v !== variable)
      console.log(unknownVars)
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
        // math.js:
        textFeedback = (
          <TeX>
            {expr.toTex({
              parenthesis: "auto",
              handler: customLaTeX,
              implicit: "show",
            })}
          </TeX>
        )
        // Nerdamer:
        // textFeedback = <TeX>{expr.toTeX()}</TeX>
        feedbackType = "ok"
      }
    } catch {
      textFeedback = "unable to parse your expression"
    }

    try {
      if (feedbackType === "ok") {
        testOutput = (
          <>
            <TeX>a={nerdamer(a.toString()).toTeX()}</TeX>
            <br />
            <TeX>b={nerdamer(b.toString()).toTeX()}</TeX>
          </>
        )
        // testOutput = (
        //   <div>
        //     {testOutput}
        //     <br />
        //     text/a=
        //     <TeX>
        //       {nerdamer(
        //         `limit((${text})/(${a.toString()}),${variable},Infinity)`
        //       ).toTeX()}
        //     </TeX>
        //     <br />
        //     text/b=
        //     <TeX>
        //       {nerdamer(
        //         `limit((${text})/(${b.toString()}),${variable},Infinity)`
        //       ).toTeX()}
        //     </TeX>
        //   </div>
        // )
      }
    } catch {
      textFeedback = "your expression is too complicated, please simplify it"
      feedbackType = "error"
    }
  }
  const msgColor =
    feedbackType === "error"
      ? "text-red-600 dark:text-red-400"
      : "text-green-600 dark:text-green-400"

  const title = t(RelateToSum.title)
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
      if (textFeedback === null) return
      playPassSound()
      setMode("correct")
    } else if (mode === "correct" || mode === "incorrect") {
      onResult(mode)
    }
  }
  return (
    <QuestionContainer>
      <QuestionHeader title={title} regeneratable={regeneratable} />
      <Trans t={t} i18nKey="asymptotics.RelateToSum.text">
        Enter a function <TeX>{{ functionDeclaration } as any}</TeX> that
        satisfies{" "}
        <TeX block>
          {functionName}({variable}) \in {{ aTeX } as any}
        </TeX>{" "}
        and{" "}
        <TeX block>
          {functionName}({variable}) \in {{ bTeX } as any}\,.
        </TeX>
        <br />
        <br />
        <div className="flex place-items-center gap-2 pl-3">
          <TeX>
            {functionName}({variable})=
          </TeX>
          <input
            type="text"
            onChange={(e) => {
              setText(e.target.value)
            }}
            value={text}
            className="rounded-md bg-gray-300 p-2 dark:bg-gray-900"
          />
          <div className={msgColor}>{textFeedback}</div>
        </div>
        <div>{testOutput}</div>
        <div className="p-5 text-slate-600 dark:text-slate-400">
          Note: This text field accepts <i>simple</i> mathematical expressions,
          such as &ldquo;<span className="font-mono">96n^3</span>&rdquo;,{" "}
          &ldquo;<span className="font-mono">n log(n)</span>&rdquo;, &ldquo;
          <span className="font-mono">n^(2/3)</span>&rdquo;, or &ldquo;
          <span className="font-mono">n^2 / log(log(n))</span>&rdquo;.
        </div>
      </Trans>
      <QuestionFooter mode={mode} message={message} buttonClick={handleClick} />
    </QuestionContainer>
  )
}
RelateToSum.variants = ["default"]
RelateToSum.path = "asymptotics/relate"
RelateToSum.title = "asymptotics.relate.title"

// function MathNodeToAsymptoticTerm(node: MathNode): AsymptoticTerm {
//   const term = new AsymptoticTerm({})
//   if (node.isOperatorNode) {
//     if (node.op === "^") {
//       const base = node.args[0]
//       if (base.isSymbolNode) {
//       } else if (base.isConstantNode) {
//       } else {
//         return null
//       }
//       const exponent = node.args[1]
//     }
//   }
// }

/**
 * The following function can parse simple mathematical expressions, such as
 * "n^3", "log n", "n^3 * log n", "n^3 * log log n", "n/ log log n".
 *
 * NOTE: We are now using math.parse() from mathjs instead.
 */
// function parseSimpleMath(str: string) {
//   // first, we identify the tokens:
//   // sequences of letters and numbers are tokens, such as "log" everything else is a separator
//   str = str
//     .split(/([A-Za-z]+)/)
//     .filter((e) => e.trim().length > 0)
//     .join(" ")
//   const tokens = str
//     .split(/([0-9]+)/)
//     .filter((e) => e.trim().length > 0)
//     .join(" ")

//   // Now we construct the parse tree:
//   const stack = []
//   for (const token of tokens) {
//     if (token === "*") {
//       const a = stack.pop()
//       const b = stack.pop()
//       stack.push(`${b} \\cdot ${a}`)
//     } else if (token === "/") {
//       const a = stack.pop()
//       const b = stack.pop()
//       stack.push(`\\frac{${b}}{${a}}`)
//     } else {
//       stack.push(token)
//     }
//   }
// }
