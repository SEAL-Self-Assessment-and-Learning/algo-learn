import { TFunction } from "i18next"
import moment from "moment/moment"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"
import { BsFillCheckSquareFill, BsFillXSquareFill } from "react-icons/bs"
import { Link } from "react-router-dom"
import { Button } from "../components/Button"
import {
  averageStrength,
  LogEntry,
  questionByPath,
  questions,
  QuizQuestion,
  questionVariants,
  useSkills,
} from "../hooks/useSkills"

/** LearningProgress component */
export function LearningProgress() {
  const { t } = useTranslation()
  const { strengthMap, featureMap, unlockedSkills, log } = useSkills()
  const [selectedLogRev, setSelectedLog] = useState(log)
  const selectedLog: LogEntry[] = selectedLogRev.slice()
  selectedLog.reverse()

  function selectQuestion(q: QuizQuestion) {
    const selection = []
    for (const e of log) {
      if (e.question === q.path) {
        selection.push(e)
      }
      if (selection.length == 10) break
    }
    setSelectedLog(selection)
  }
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="my-5">{t("Training")}</h1>

      <div className="flex flex-col place-items-center">
        <div className="mt-2">
          <b>1. {t("Practice")}:</b> {t("Practice.desc")}
        </div>
        <Button to="/practice" color="green" className="m-5">
          {t("Practice")}
        </Button>
        <div className="mt-6">
          <b>2. {t("Examine")}:</b> {t("Examine.desc")}
        </div>
        <Button to="/examine" color="cyan" className="m-5">
          {t("Examine")}
        </Button>
      </div>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("your-learning-progress")}
      </h2>
      <table>
        <tbody>
          <ProgressLine isHead />
          {questions.map((q) => (
            <ProgressLine
              key={q.path}
              // onMouseOver={() => selectQuestion(q)}
              // onMouseOut={() => setSelectedLog(log)}
              question={q}
              strength={averageStrength({ strengthMap, path: q.path })}
            />
          ))}
        </tbody>
      </table>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("detailed-learning-progress")}
      </h2>
      <p className="my-5">{t("detailed-learning-progress-text")}</p>
      <table>
        <tbody>
          <ProgressLine isHead showVariant />
          {questionVariants.map(({ question, variant, path }) => (
            <ProgressLine
              key={path}
              onMouseOver={() => selectQuestion(question)}
              onMouseOut={() => setSelectedLog(log)}
              question={question}
              variant={variant}
              qualified={featureMap[path].qualified}
              unlocked={path in unlockedSkills}
              strength={strengthMap[path].p}
              halflife={strengthMap[path].h}
            />
          ))}
        </tbody>
      </table>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("History")}
      </h2>
      <p className="my-5">{t("history-text")}</p>
      <table className="w-full">
        <tbody>
          <HistoryLines t={t} isHead />
          <HistoryLines t={t} progress={selectedLog} />
        </tbody>
      </table>
    </div>
  )
}

function Thd({
  children,
  className = "",
  isHead = false,
}: {
  children: ReactNode
  className?: string
  isHead?: boolean
}) {
  const Tag = isHead ? "th" : "td"
  return <Tag className={`px-2 py-3 ${className}`}>{children}</Tag>
}

function ProgressLine({
  question,
  variant,
  strength,
  halflife,
  unlocked,
  qualified,
  isHead = false,
  showVariant = false,
  onMouseOver,
  onMouseOut,
}: {
  question?: QuizQuestion
  variant?: string
  strength?: number
  halflife?: number
  unlocked?: boolean
  qualified?: boolean
  isHead?: boolean
  showVariant?: boolean
  onMouseOver?: () => void
  onMouseOut?: () => void
}) {
  const { t } = useTranslation()
  if (isHead) {
    return (
      <tr
        className={
          "font-bold [&:nth-child(odd)]:bg-black/10 dark:[&:nth-child(odd)]:bg-white/10"
        }
      >
        <Thd isHead>
          {t("Skill")} {showVariant ? `(${t("question-variant")})` : ""}
        </Thd>
        <Thd isHead>{t("Strength")}</Thd>
      </tr>
    )
  }

  if (strength === undefined || question === undefined) {
    return null
  }
  const percentage = Math.round(strength * 100)
  const strengthTooltip = `Estimated strength: ${percentage}%. Decays over time, so practice regularly!${
    halflife
      ? ` (Estimated halflife: ~${Math.round(halflife * 10) / 10} days.)`
      : ""
  }`
  return (
    <tr
      className={`[&:nth-child(odd)]:bg-black/10 dark:[&:nth-child(odd)]:bg-white/10`}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Thd>
        <Link to={question.path}>
          {t(question.title)}
          {variant ? ` (${variant})` : ""}
        </Link>
      </Thd>
      <Thd>
        <button
          aria-label={strengthTooltip}
          data-microtip-position="right"
          data-microtip-size="large"
          role="tooltip"
          className="grid cursor-default place-items-center"
        >
          <StrengthMeter strength={strength} />
        </button>
      </Thd>
    </tr>
  )
}

/**
 * Display a strength meter / progress bar
 *
 * @param {Object} props
 * @param {number} strength A number between 0 and 1
 */
function StrengthMeter({ strength }: { strength: number }) {
  const strengthBasic = (strength < 0.5 ? Math.round : Math.ceil)(strength * 4)
  const present = <div className={`inline-block h-4 w-4 bg-green-500`}></div>
  const absent = <div className={`inline-block h-4 w-4 bg-slate-500`}></div>
  let bar = <></>
  for (let i = 0; i <= 3; i++) {
    bar = (
      <>
        {bar}
        {i < strengthBasic ? present : absent}
      </>
    )
  }
  return <div className="flex h-4 gap-2 text-left">{bar}</div>
}

function PassFailButton({
  className = "",
  result,
}: {
  className?: string
  result: string
}) {
  const { t } = useTranslation()
  return (
    <button
      aria-label={t(`result-${result}`) || undefined}
      data-microtip-position="left"
      role="tooltip"
      className="cursor-default"
    >
      {result === "pass" ? (
        <BsFillCheckSquareFill
          className={`text-lg text-green-700 dark:text-green-500 ${className}`}
        />
      ) : (
        <BsFillXSquareFill
          className={`text-lg text-red-700 dark:text-red-500 ${className}`}
        />
      )}
    </button>
  )
}

// function LinkToQuestion({ to }: { to: string }) {
//   const { t } = useTranslation()
//   return (
//     <button
//       aria-label={t("Look at this question again")}
//       data-microtip-position="left"
//       role="tooltip"
//       className="grid place-items-center"
//     >
//       <Link to={to} className="h-full w-full">
//         <BiLink className="inline text-lg" />
//       </Link>
//     </button>
//   )
// }

function HistoryLines({
  t,
  progress,
  isHead = false,
}: {
  t: TFunction
  progress?: Array<LogEntry>
  isHead?: boolean
}) {
  if (isHead) {
    return (
      <tr
        className={`font-bold [&:nth-child(odd)]:bg-black/10 dark:[&:nth-child(odd)]:bg-white/10`}
      >
        <Thd className="w-1/2" isHead>
          {t("time")}
        </Thd>
        <Thd className="w-1/2" isHead>
          {t("question")} ({t("question-variant")})
        </Thd>
      </tr>
    )
  }

  if (progress === undefined) {
    return null
  }

  let history = <></>
  for (const event of progress) {
    const question = questionByPath(event.question)
    if (question !== undefined) {
      history = (
        <>
          {history}
          <tr
            className={`[&:nth-child(odd)]:bg-black/10 dark:[&:nth-child(odd)]:bg-white/10`}
          >
            <Thd>
              <Link to={`${event.question}/${event.variant}/${event.seed}`}>
                {moment(event.timestamp).fromNow()}
              </Link>
            </Thd>
            <Thd>
              {t(question.title)} ({event.variant}{" "}
              <PassFailButton
                className="inline opacity-50"
                result={event.result}
              />
              )
            </Thd>
          </tr>
        </>
      )
    }
  }
  return history
}
