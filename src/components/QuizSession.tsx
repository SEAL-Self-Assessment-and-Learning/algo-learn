import random from "random"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  questionByPath,
  randomHighestSkill,
  useSkills,
  weakestSkill,
} from "../questions"
import { TermSetVariants } from "../utils/AsymptoticTerm"
import { genSeed } from "../utils/genseed"
import { Button } from "./Button"
import { CenterScreen } from "./CenterScreen"

/**
 * QuizQuestion: Display a quiz question.
 * @param {onResult} function Call this function once the question was answered.
 */
// type QuizQuestion = (
//   onResult: (result: "correct" | "incorrect" | "abort") => void
// ) => ReactElement

// export function QuizSession({
//   questions,
//   onFinished,
// }: {
//   questions: Array<QuizQuestion>
//   onFinished: () => void
// }) {

export function QuizSession({
  targetNum = 3,
  practiceMode = true,
}: {
  targetNum: number
  practiceMode: boolean
}) {
  const { t } = useTranslation()
  const [{ numCorrect, numIncorrect, aborted }, setState] = useState({
    numCorrect: 0,
    numIncorrect: 0,
    aborted: false,
  })
  const { strengthMap, unlockedSkills, appendLogEntry } = useSkills()
  if (aborted) {
    return (
      <CenterScreen>
        Your session was aborted.
        <Button to={"/"} color="green">
          Continue
        </Button>
      </CenterScreen>
    )
  }
  const num = numCorrect + numIncorrect

  if (num < targetNum) {
    const nextPath = practiceMode
      ? weakestSkill({
          strengthMap,
          skills: unlockedSkills,
          noise: 0.2,
        })
      : randomHighestSkill()

    const Q = questionByPath(nextPath)
    const [skillGroup, question, variant] = nextPath.split("/")
    if (!Q) throw Error(`Question with path '${nextPath}' not found!`)

    const seed = genSeed()

    const handleResult = (result: "correct" | "incorrect" | "abort") => {
      if (result === "correct") {
        setState({ numCorrect: numCorrect + 1, numIncorrect, aborted })
        appendLogEntry({
          question: `${skillGroup}/${question}`,
          variant,
          seed,
          result: "pass",
          timestamp: Date.now(),
        })
      } else if (result === "incorrect") {
        setState({ numCorrect, numIncorrect: numIncorrect + 1, aborted })
        appendLogEntry({
          question: `${skillGroup}/${question}`,
          variant,
          seed,
          result: "fail",
          timestamp: Date.now(),
        })
      } else if (result === "abort")
        setState({ numCorrect, numIncorrect, aborted })
    }

    return (
      <Q
        key={seed}
        seed={seed}
        variant={variant as TermSetVariants}
        onResult={handleResult}
        t={t}
        regeneratable={false}
      />
    )
  } else {
    const great = ["Great job!", "Well done!", "Perfect!"]
    const good = ["Not bad, keep going!", "Practice makes perfect!"]
    const meh = [
      "You'll do better next time!",
      "Keep it up!",
      "You must try again to succeed!",
      "The universe does not play dice!",
    ]
    const msg =
      numIncorrect == 0
        ? random.choice(great)
        : numCorrect / (numCorrect + numIncorrect) >= 0.75
        ? random.choice(good)
        : random.choice(meh)
    return (
      <CenterScreen>
        <div className="w-full rounded-xl bg-black/10 p-16 dark:bg-black/20">
          <div>&quot;{msg}&quot;</div>
          <Button to={"/"} color="green" className="mt-12 ml-auto">
            Continue
          </Button>
        </div>
      </CenterScreen>
    )
  }
}
