import { ReactElement, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import {
  ALL_SKILLS,
  EXAM_SKILLS,
  pathOfQuestionVariant,
  questionByPath,
  useSkills,
  weakestSkill,
} from "../hooks/useSkills"
import { TermSetVariants } from "../utils/AsymptoticTerm"
import Random from "../utils/random"
import { Button } from "./Button"
import { ScreenCenteredDiv } from "./CenteredDivs"

const great = {
  en: [
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
  ],
  de: [
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
  ],
}
const good = {
  en: [
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
  ],
  de: [
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
  ],
}
const meh = {
  en: [
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
  ],
  de: [
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
  ],
}

/**
 * Component that renders a quiz session, consisting of a sequence of targetNum
 * questions. In practice mode, the questions are chosen among the unlocked
 * skills that our memory model determines to be the weakest for this user. In
 * exam mode, the memory model is ignored and the session selects the most
 * difficult questions for each question type (simulating part of an exam)
 *
 * @param param
 * @param param.mode Determines the mode of the session.
 */
export function QuizSession({
  mode,
}: {
  mode: "practice" | "exam"
}): ReactElement {
  const params = useParams()
  const partialPath = params["*"] ?? ""

  const { t, i18n } = useTranslation()
  const [{ sessionSeed, targetNum }] = useState({
    sessionSeed: new Random(Math.random()).base36string(7),
    targetNum: 3,
  })
  const { featureMap, appendLogEntry } = useSkills()
  const [{ numCorrect, numIncorrect, status }, setState] = useState({
    numCorrect: 0,
    numIncorrect: 0,
    status: "running" as "running" | "finished" | "aborted",
  })
  const navigate = useNavigate()
  useGlobalDOMEvents({
    keydown(e: Event) {
      const key = (e as KeyboardEvent).key
      if (key === "Enter" && status !== "running") {
        e.preventDefault()
        navigate("/")
      }
    },
  })

  const num = numCorrect + numIncorrect
  const random = new Random(`${sessionSeed}${numCorrect + numIncorrect}`)
  const questionSeed = random.base36string(7)

  if (status === "aborted") {
    return (
      <ScreenCenteredDiv>
        {t("quiz-session-aborted")}
        <Button to={"/"} color="green">
          {t("Continue")}
        </Button>
      </ScreenCenteredDiv>
    )
  } else if (status === "running") {
    if (num === targetNum) {
      setState({ numCorrect, numIncorrect, status: "finished" })
    }
    const fromSkills = (
      mode === "practice"
        ? ALL_SKILLS.map(pathOfQuestionVariant)
        : EXAM_SKILLS.map(pathOfQuestionVariant)
    ).filter((s) => s.startsWith(partialPath))
    const nextPath =
      mode === "practice"
        ? weakestSkill({
            random,
            featureMap,
            fromSkills,
            noise: 0.2,
          })
        : random.choice(fromSkills)
    const Q = questionByPath(nextPath)
    const [skillGroup, question, variant] = nextPath.split("/")
    if (!Q) throw Error(`Question with path '${nextPath}' not found!`)

    const handleResult = (result: "correct" | "incorrect" | "abort") => {
      if (result === "correct") {
        appendLogEntry({
          question: `${skillGroup}/${question}`,
          variant,
          seed: questionSeed,
          result: "pass",
          timestamp: Date.now(),
        })
        setState({ numCorrect: numCorrect + 1, numIncorrect, status })
      } else if (result === "incorrect") {
        appendLogEntry({
          question: `${skillGroup}/${question}`,
          variant,
          seed: questionSeed,
          result: "fail",
          timestamp: Date.now(),
        })
        setState({ numCorrect, numIncorrect: numIncorrect + 1, status })
      } else if (result === "abort")
        setState({ numCorrect, numIncorrect, status })
    }

    return (
      <Q.Component
        key={questionSeed}
        seed={questionSeed}
        variant={variant as TermSetVariants}
        onResult={handleResult}
        t={t}
      />
    )
  }

  // now we have status === "finished"
  const msgList =
    numIncorrect == 0
      ? great
      : numCorrect / (numCorrect + numIncorrect) >= 0.75
      ? good
      : meh
  const msg = random.choice(msgList[i18n.language === "de" ? "de" : "en"])
  return (
    <ScreenCenteredDiv>
      <div className="w-full rounded-xl bg-black/10 p-16 dark:bg-black/20">
        <div className="font-serif italic">{msg}</div>
        <Button
          to={"/"}
          color="green"
          className="ml-auto mt-12 block max-w-max"
        >
          {t("Continue")}
        </Button>
      </div>
    </ScreenCenteredDiv>
  )
}
