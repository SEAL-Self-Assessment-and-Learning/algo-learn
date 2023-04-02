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
  Question,
  ALL_SKILLS,
  useSkills,
  pathOfQuestionVariant,
  skillGroups,
  questionSetByPath,
} from "../hooks/useSkills"
import { StrengthMeter } from "../components/StrengthMeter"
import { TiLockClosed, TiLockOpen } from "react-icons/ti"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { SkillFeaturesAndPredictions } from "../utils/memory-model"
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar"

/** LearningProgress component */
export function LearningProgress() {
  const { t } = useTranslation()
  const { featureMap, unlockedSkills, log } = useSkills()
  return (
    <HorizontallyCenteredDiv>
      <h1 className="my-5">{t("Training")}</h1>
      {t("Training.desc")}
      <ol className="my-5 ml-8 list-decimal">
        <li>
          <b>{t("Practice")}.</b> {t("Practice.desc")}
        </li>
        <li>
          <b>{t("Examine")}.</b> {t("Examine.desc")}
        </li>
      </ol>

      <h2 className="mb-5 mt-5 border-black/10 pt-2 dark:border-white/10">
        {t("home.skill-groups")}
      </h2>
      <div>{t("train.skills.desc")}</div>
      <div className="m-6 flex flex-wrap gap-6">
        {skillGroups.map((g) => (
          <SkillGroupCard
            t={t}
            key={g}
            partialPath={g}
            featureMap={featureMap}
          />
        ))}
      </div>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("your-learning-progress")}
      </h2>
      <table className="tbl">
        <tbody>
          <QuestionTableHead t={t} />
          {questions.map((q) => (
            <QuestionTableRow
              t={t}
              key={q.name}
              question={q}
              unlocked
              qualified
              strength={averageStrength({
                strengthMap: featureMap,
                path: q.name,
              })}
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
          <QuestionTableHead t={t} showVariant />
          {ALL_SKILLS.map((qv) => {
            const path = pathOfQuestionVariant(qv)
            return (
              <QuestionTableRow
                t={t}
                key={path}
                question={qv.question}
                variant={qv.variant}
                qualified={featureMap[path].mastered}
                unlocked={unlockedSkills.find((s) => s === path) !== undefined}
                strength={featureMap[path].p}
                halflife={featureMap[path].h}
              />
            )
          })}
        </tbody>
      </table>
      <LogTable
        t={t}
        log={log}
        className="mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10"
      />
    </HorizontallyCenteredDiv>
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
    <tr>
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

function SkillGroupCard({
  t,
  partialPath,
  featureMap,
}: {
  t: TFunction
  partialPath: string
  featureMap: { [path: string]: SkillFeaturesAndPredictions }
}) {
  const QVs = questionSetByPath(partialPath)
  const qualified = QVs.filter(
    (qv) => featureMap[pathOfQuestionVariant(qv)].mastered
  )
  const done = qualified.length
  const total = QVs.length
  const skillName = t("skill." + partialPath)
  return (
    <div className="bg-shading flex w-[30%] flex-col items-center gap-3 rounded-lg p-5">
      <div className="w-min text-center font-bold">{skillName}</div>
      <div className="w-32 text-center text-xl">
        <CircularProgressbarWithChildren
          value={done}
          maxValue={total}
          strokeWidth={18}
          background
          styles={buildStyles({
            pathColor: "green",
            trailColor: "gray",
          })}
        >
          <div className="text-slate-500">
            <span className="font-bold text-black">{done}</span>/{total}
            <br />
            XP
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <Button to={"/practice/" + partialPath} color="green">
        {t("Practice")}
      </Button>
      <Button to={"/exam/" + partialPath} color="cyan">
        {t("Examine")}
      </Button>
    </div>
  )
}

function QuestionTableHead({
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

function QuestionTableRow({
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
  question: Question
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
        <Link to={"practice/" + question.name + (variant ? "/" + variant : "")}>
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
