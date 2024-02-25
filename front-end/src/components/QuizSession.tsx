import { ReactElement, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { serializeGeneratorCall } from "../../../shared/src/api/QuestionRouter"
import Random, { sampleRandomSeed } from "../../../shared/src/utils/random"
import useGlobalDOMEvents from "../hooks/useGlobalDOMEvents"
import { sortByStrength, useSkills } from "../hooks/useSkills"
import { useTranslation } from "../hooks/useTranslation"
import { generatorSetBelowPath } from "../listOfQuestions"
import { Button } from "@/components/ui/button"
import { ScreenCenteredDiv } from "./CenteredDivs"
import { Result } from "./QuestionComponent"
import { ViewSingleQuestion } from "../routes/ViewSingleQuestion"

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
 * @param param.targetNum The number of questions in the session. (default: 10)
 * @param param.mode Determines the mode of the session.
 */
export function QuizSession({
  targetNum = 10,
  mode,
}: {
  targetNum?: number
  mode: "practice" | "exam"
}): ReactElement {
  const { featureMap: fM, appendLogEntry } = useSkills()
  const [{ sessionSeed, featureMap }] = useState({
    sessionSeed: sampleRandomSeed(),
    featureMap: fM, // store in state to prevent re-rendering
  })
  const params = useParams()
  const partialPath = params["*"] ?? ""
  const questionVariants = useMemo(() => {
    if (mode === "exam") {
      throw new Error("exam mode not implemented yet")
    }
    // TODO: if mode === "exam", use the most difficult questions instead
    return sortByStrength({
      random: new Random(sessionSeed),
      featureMap,
      generatorCalls: generatorSetBelowPath(partialPath),
    }).slice(0, targetNum)
  }, [sessionSeed, partialPath, targetNum, mode, featureMap])

  const { t, lang } = useTranslation()
  const [state, setState] = useState({
    numCorrect: 0,
    numIncorrect: 0,
    aborted: false,
  })
  const { numCorrect, numIncorrect, aborted } = state
  const navigate = useNavigate()
  useGlobalDOMEvents({
    keydown(e: Event) {
      const key = (e as KeyboardEvent).key
      if (key === "Enter" && status !== "running") {
        e.preventDefault()
        navigate(`/${lang}`)
      }
    },
  })

  const num = numCorrect + numIncorrect
  const random = new Random(`${sessionSeed}${numCorrect + numIncorrect}`)
  const questionSeed = random.base36string(7)

  const status: "running" | "finished" | "aborted" = aborted
    ? "aborted"
    : num < questionVariants.length
      ? "running"
      : "finished"

  if (status === "aborted") {
    return (
      <ScreenCenteredDiv>
        {t("quiz-session-aborted")}
        <Button asChild variant="rightAnswer">
          <Link to={"/"}>{t("Continue")}</Link>
        </Button>
      </ScreenCenteredDiv>
    )
  } else if (status === "running") {
    const obj = questionVariants[num]
    const { generator, generatorPath, parameters } = obj
    const nextPath = serializeGeneratorCall({
      generator,
      parameters,
      seed: questionSeed,
      generatorPath: generatorPath,
    })

    const handleResult = (result: Result) => {
      if (result === "correct") {
        appendLogEntry({
          path: nextPath,
          result: "pass",
          timestamp: Date.now(),
        })
        setState({ ...state, numCorrect: numCorrect + 1 })
      } else if (result === "incorrect") {
        appendLogEntry({
          path: nextPath,
          result: "fail",
          timestamp: Date.now(),
        })
        setState({ ...state, numIncorrect: numIncorrect + 1 })
      } else if (result === "abort" || result === "timeout") {
        setState({ ...state, aborted: true })
      }
    }

    return (
      <ViewSingleQuestion
        generator={generator}
        generatorPath={generatorPath}
        parameters={parameters}
        seed={questionSeed}
        onResult={handleResult}
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
  const msg = random.choice(msgList[lang])
  return (
    <ScreenCenteredDiv>
      <div className="w-full rounded-xl bg-black/10 p-16 dark:bg-black/20">
        <div className="font-serif italic">{msg}</div>
        <Button
          asChild
          variant="rightAnswer"
          className="ml-auto mt-12 block max-w-max"
        >
          <Link to="/">{t("Continue")}</Link>
        </Button>
      </div>
    </ScreenCenteredDiv>
  )
}
