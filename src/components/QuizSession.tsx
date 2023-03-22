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
  const { t, i18n } = useTranslation()
  const [{ numCorrect, numIncorrect, aborted }, setState] = useState({
    numCorrect: 0,
    numIncorrect: 0,
    aborted: false,
  })
  const { strengthMap, unlockedSkills, appendLogEntry } = useSkills()
  
  // TODO: does not work as expected as the seed is regenerated on every render, so even if we just switch the language
  const seed = genSeed()

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
    const greatEN = [
      "Perfect!",
      "Outstanding work!",
      "Fantastic job!",
      "You're a quiz whiz!",
      "Excellent performance!",
      "Impressive results!",
      "Great work!",
      "Amazing job!",
      "Incredible performance!",
      "Brilliant work!",
      "Superb job!",
    ]
    const goodEN = [
      "Nice job, keep it up!",
      "You're on the right track!",
      "Solid effort, keep practicing!",
      "You're improving with each try!",
      "Well done, but there's always room for improvement!",
      "Good job!",
      "Great effort!",
      "Well played!",
      "Impressive improvement!",
      "You're getting there!",
    ]
    const mehEN = [
      "You'll do better next time!",
      "Not bad, keep working at it!",
      "You're making progress, keep going!",
      "Keep practicing, you'll get there!",
      "Don't give up, you're improving!",
      "A little more effort and you'll see better results!",
      "You must try again to succeed!",
      "Keep it up!",
      "Stay focused!",
      "Keep pushing!",
      "You're improving!",
      "You're getting better!",
    ]
    const greatDE = [
      "Perfekt!",
      "Hervorragende Arbeit!",
      "Fantastische Arbeit!",
      "Du bist ein Quiz-Genie!",
      "Ausgezeichnete Leistung!",
      "Beeindruckende Ergebnisse!",
      "Großartige Arbeit!",
      "Erstaunliche Arbeit!",
      "Unglaubliche Leistung!",
      "Brillante Arbeit!",
      "Hervorragende Arbeit!",
    ]
    const goodDE = [
      "Gute Arbeit, weiter so!",
      "Du bist auf dem richtigen Weg!",
      "Solide Anstrengung, weiter üben!",
      "Du verbesserst dich mit jedem Versuch!",
      "Gut gemacht, aber es gibt immer Raum für Verbesserungen!",
      "Gute Arbeit!",
      "Große Anstrengung!",
      "Gut gespielt!",
      "Beeindruckende Verbesserung!",
      "Du kommst näher!",
    ]
    const mehDE = [
      "Beim nächsten Mal wirst du es besser machen!",
      "Nicht schlecht, weiter so!",
      "Du machst Fortschritte, bleib dran!",
      "Übe weiter, du wirst es schaffen!",
      "Gib nicht auf, du verbesserst dich!",
      "Ein wenig mehr Anstrengung und du wirst bessere Ergebnisse sehen!",
      "Du musst es erneut versuchen, um erfolgreich zu sein!",
      "Weiter so!",
      "Bleib fokussiert!",
      "Bleib dran!",
      "Du verbesserst dich!",
      "Du wirst besser!",
    ]
    const great = i18n.language === "de" ? greatDE : greatEN
    const good = i18n.language === "de" ? goodDE : goodEN
    const meh = i18n.language === "de" ? mehDE : mehEN
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
