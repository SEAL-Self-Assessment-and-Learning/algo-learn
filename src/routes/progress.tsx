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
import { getImageURL } from "../effects/images"
import { Tooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"

/** LearningProgress component */
export function LearningProgress() {
  const { t } = useTranslation()
  const { featureMap, unlockedSkills, log } = useSkills()
  return (
    <HorizontallyCenteredDiv>
      <h1 className="my-5">{t("Practice")}</h1>
      <div>
        {t("Practice.desc")} {t("train.skills.desc")}
      </div>
      <div className="m-6 mx-auto flex flex-wrap justify-center gap-6">
        {skillGroups.map((g) => (
          <SkillGroupCard key={g} partialPath={g} featureMap={featureMap} />
        ))}
      </div>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("Exam")}
      </h2>
      <div>{t("Examine.desc")}</div>
      <Button to="/exam" color="red" className="mt-5">
        {t("start exam")}
      </Button>
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("your-learning-progress")}
      </h2>
      <table className="tbl">
        <tbody>
          <QuestionTableHead />
          {questions.map((q) => (
            <QuestionTableRow
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
          <QuestionTableHead showVariant />
          {ALL_SKILLS.map((qv) => {
            const path = pathOfQuestionVariant(qv)
            return (
              <QuestionTableRow
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
        log={log}
        className="mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10"
      />
    </HorizontallyCenteredDiv>
  )
}

function LogTable({
  log,
  className = "",
}: {
  log: LogEntry[]
  className?: string
}) {
  const { t } = useTranslation()
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
            <LogTableRow key={entry.timestamp} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LogTableRow({ entry }: { entry: LogEntry }) {
  const { t } = useTranslation()
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
  partialPath,
  featureMap,
}: {
  partialPath: string
  featureMap: { [path: string]: SkillFeaturesAndPredictions }
}) {
  const { t } = useTranslation()
  const QVs = questionSetByPath(partialPath)
  const qualified = QVs.filter(
    (qv) => featureMap[pathOfQuestionVariant(qv)].mastered
  )
  const done = qualified.length
  const total = QVs.length
  const skillName = t("skill." + partialPath)
  return (
    <>
      <Link
        id={`skill-group-card-${partialPath}`}
        to={"/practice/" + partialPath}
        className="unstyled hover:bg-shading group rounded-lg p-2 text-center hover:cursor-pointer"
      >
        <div className="relative">
          <div
            className={`m-2 aspect-square w-28 transform items-center gap-3 overflow-hidden rounded-full text-center duration-200 group-hover:scale-110 group-hover:ease-in`}
            style={{
              backgroundSize: "cover",
              backgroundImage: `url("${getImageURL(partialPath) ?? ""}")`,
            }}
          >
            {/* <CircularProgressbarWithChildren
            value={done}
            maxValue={total}
            strokeWidth={14}
            styles={buildStyles({
              pathColor: "green",
              trailColor: "transparent",
            })}
          ></CircularProgressbarWithChildren> */}
          </div>
          {/* // XP in circle at bottom right
        <div className="absolute bottom-0 right-0 flex aspect-square w-8 items-center justify-center rounded-full bg-goethe-100 p-1 text-xs font-bold text-black">
          <div>{done}</div>
        </div> */}
        </div>
        <div className="mx-auto flex w-max items-center justify-center text-xs font-bold">
          <div>
            {done}/{total} XP
          </div>
        </div>
        <div className="flex items-start justify-center group-hover:font-bold">
          {skillName}
        </div>
        {/* <div className="absolute -ml-2 hidden bg-red-500 p-2 group-hover:block">
        <div className="min-w-[8rem] text-white">Click to practice!</div>
      </div> */}
      </Link>
      <Tooltip anchorSelect={`#skill-group-card-${partialPath}`} place="bottom">
        Click to practice!
      </Tooltip>
    </>
  )
  return (
    <div className="bg-shading flex items-center gap-3 rounded-lg p-5">
      <div className="w-min flex-grow font-bold">{skillName}</div>
      {/* <div className="w-10 text-center text-xl"> */}
      <div className="w-10">
        <CircularProgressbarWithChildren
          value={done}
          maxValue={total}
          strokeWidth={28}
          background
          styles={buildStyles({
            pathColor: "green",
            trailColor: "gray",
          })}
        >
          {/* <div className="text-slate-500">
            <span className="font-bold text-black">{done}</span>/{total}
            <br />
            XP
          </div> */}
        </CircularProgressbarWithChildren>
      </div>
      <div className="text-slate-500">
        <span className="font-bold text-black">{done}</span>/{total} XP
      </div>
      {/* </div> */}
      <Button to={"/practice/" + partialPath} color="green">
        {t("Practice")}
      </Button>
      {/* <Button to={"/exam/" + partialPath} color="cyan">
        {t("Exam")}
      </Button> */}
    </div>
  )
}

function QuestionTableHead({ showVariant = false }: { showVariant?: boolean }) {
  const { t } = useTranslation()
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
  question,
  variant,
  strength,
  halflife,
  qualified,
  unlocked,
  onMouseOver,
  onMouseOut,
}: {
  question: Question
  variant?: string
  strength: number
  halflife?: number
  qualified?: boolean
  unlocked?: boolean
  onMouseOver?: () => void
  onMouseOut?: () => void
}) {
  const { t } = useTranslation()
  const id = question.name.replaceAll("/", "-") + (variant ? "-" + variant : "")
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
          <StrengthMeter
            id={id}
            strength={strength}
            tooltip={strengthTooltip}
          />
        )}
      </td>
    </tr>
  )
}
