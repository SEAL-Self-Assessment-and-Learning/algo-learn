import { TFunction } from "i18next"
import moment from "moment/moment"
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
import { StrengthMeter } from "../components/StrengthMeter"
import { TiLockClosed, TiLockOpen } from "react-icons/ti"

/** LearningProgress component */
export function LearningProgress() {
  const { t } = useTranslation()
  const { strengthMap, featureMap, unlockedSkills, log } = useSkills()
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
      <table className="tbl">
        <tbody>
          <SkillTableHead t={t} />
          {questions.map((q) => (
            <SkillTableRow
              t={t}
              key={q.path}
              question={q}
              unlocked
              qualified
              strength={averageStrength({ strengthMap, path: q.path })}
            />
          ))}
        </tbody>
      </table>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("detailed-learning-progress")}
      </h2>
      <p className="my-5">{t("detailed-learning-progress-text")}</p>
      <table className="tbl">
        <tbody>
          <SkillTableHead t={t} showVariant />
          {questionVariants.map(({ question, variant, path }) => (
            <SkillTableRow
              t={t}
              key={path}
              question={question}
              variant={variant}
              qualified={featureMap[path].qualified}
              unlocked={unlockedSkills.find((s) => s === path) !== undefined}
              strength={strengthMap[path].p}
              halflife={strengthMap[path].h}
            />
          ))}
        </tbody>
      </table>
      <LogTable
        t={t}
        log={log}
        className="mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10"
      />
    </div>
  )
}

function LogTable({
  t,
  log,
  className = "",
}: {
  t: TFunction
  log: LogEntry[]
  className?: string
}) {
  return (
    <div className={className}>
      <h2>{t("History")}</h2>
      <p className="my-5">{t("history-text")}</p>
      <table className="tbl">
        <tbody>
          <tr>
            <th>{t("time")}</th>
            <th>
              {t("question")} ({t("question-variant")})
            </th>
          </tr>
          {log.map((entry) => (
            <LogTableRow key={entry.timestamp} t={t} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LogTableRow({ t, entry }: { t: TFunction; entry: LogEntry }) {
  const title = questionByPath(entry.question)?.title
  if (title === undefined) return null
  return (
    <tr className="[&:nth-child(odd)]:bg-black/10 dark:[&:nth-child(odd)]:bg-white/10">
      <td>
        <PassFailButton
          className="mr-2 inline opacity-50"
          result={entry.result}
        />
        {moment(entry.timestamp).fromNow()}
      </td>
      <td>
        {t(title)} ({entry.variant}) [
        <Link to={`${entry.question}/${entry.variant}/${entry.seed}`}>
          view
        </Link>
        ]
      </td>
    </tr>
  )
}

function PassFailButton({
  className = "",
  result,
}: {
  className?: string
  result: "pass" | "fail"
}) {
  return result === "pass" ? (
    <BsFillCheckSquareFill
      className={`mb-[0.2ex] inline w-[0.75em] text-lg text-green-700 dark:text-green-500 ${className}`}
    />
  ) : (
    <BsFillXSquareFill
      className={`mb-[0.2ex] inline w-[0.75em] text-lg text-red-700 dark:text-red-500 ${className}`}
    />
  )
}

function SkillTableHead({
  t,
  showVariant = false,
}: {
  t: TFunction
  showVariant?: boolean
}) {
  return (
    <tr>
      <th>
        {t("Skill")} {showVariant ? `(${t("question-variant")})` : ""}
      </th>
      <th>{t("Strength")}</th>
    </tr>
  )
}

function SkillTableRow({
  t,
  question,
  variant,
  strength,
  halflife,
  qualified,
  unlocked,
  onMouseOver,
  onMouseOut,
}: {
  t: TFunction
  question: QuizQuestion
  variant?: string
  strength: number
  halflife?: number
  qualified?: boolean
  unlocked?: boolean
  onMouseOver?: () => void
  onMouseOut?: () => void
}) {
  const percentage = Math.round(strength * 100)
  const strengthTooltip = `Estimated strength: ${percentage}%. Decays over time, so practice regularly!${
    halflife
      ? ` (Estimated halflife: ~${Math.round(halflife * 10) / 10} days.)`
      : ""
  }`
  return (
    <tr onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <td>
        <Link to={question.path}>
          {t(question.title)}
          {variant ? ` (${variant})` : ""}
        </Link>
      </td>
      <td>
        {!unlocked && !qualified ? (
          <span className="text-yellow-800 dark:text-yellow-200">
            <TiLockClosed className="mb-[0.3ex] inline" /> (locked)
          </span>
        ) : unlocked && !qualified ? (
          <span className="text-green-800 dark:text-green-200">
            <TiLockOpen className="mb-[0.3ex] inline" /> (practicing...)
          </span>
        ) : (
          <StrengthMeter strength={strength} tooltip={strengthTooltip} />
        )}
      </td>
    </tr>
  )
}
