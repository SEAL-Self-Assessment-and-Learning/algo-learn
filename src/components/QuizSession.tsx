import random, { RNGFactory } from "random"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  questionByPath,
  randomHighestSkill,
  useSkills,
  weakestSkill,
} from "../hooks/useSkills"
import { TermSetVariants } from "../utils/AsymptoticTerm"
import { genSeed } from "../utils/genSeed"
import { Button } from "./Button"
import { CenterScreen } from "./CenterScreen"

/**
 * Component that renders a quiz session, consisting of a sequence of targetNum
 * questions. In practice mode, the questions are chosen among the unlocked
 * skills that our memory model determines to be the weakest for this user. In
 * exam mode, the memory model is ignored and the session selects the most
 * difficult questions for each question type (simulating part of an exam)
 *
 * @param {object} param
 * @param {string} param.mode Determines the mode of the session.
 */
export function QuizSession({ mode }: { mode: "practice" | "examine" }) {
  const { t, i18n } = useTranslation()
  const [{ seed, targetNum }] = useState({
    seed: genSeed(),
    targetNum: 3,
  })
  const [{ numCorrect, numIncorrect, aborted }, setState] = useState({
    numCorrect: 0,
    numIncorrect: 0,
    aborted: false,
  })
  const { strengthMap, unlockedSkills, appendLogEntry } = useSkills()

  const rng = random.clone(RNGFactory(seed))
  const questionSeed = genSeed({ seed: `${seed}${numCorrect + numIncorrect}` })

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
    const nextPath =
      mode === "practice"
        ? weakestSkill({
            rng,
            strengthMap,
            skills: unlockedSkills,
            noise: 0.2,
          })
        : randomHighestSkill({ rng })
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
        key={questionSeed}
        seed={questionSeed}
        variant={variant as TermSetVariants}
        onResult={handleResult}
        t={t}
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
      "Du bist ein Quiz-Meister!",
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
