import { BsFillCheckSquareFill, BsFillXSquareFill } from "react-icons/bs"
import { TiLockClosed, TiLockOpen } from "react-icons/ti"
import { Link } from "react-router-dom"
import { Tooltip } from "react-tooltip"

import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { StrengthMeter } from "../components/StrengthMeter"
import { getImageURL } from "../effects/images"
import { averageStrength, LogEntryV1, useSkills } from "../hooks/useSkills"
import { useTranslation } from "../hooks/useTranslation"
import { SkillFeaturesAndPredictions } from "../utils/memory-model"

import "react-tooltip/dist/react-tooltip.css"

import {
  Parameters,
  serializeParameters,
} from "../../../shared/src/api/Parameters"
import { QuestionGenerator } from "../../../shared/src/api/QuestionGenerator"
import {
  deserializePath,
  serializeGeneratorCall,
} from "../../../shared/src/api/QuestionRouter"
import {
  allQuestionGeneratorRoutes,
  generatorSetBelowPath as generatorCallsBelowPath,
  generatorSetBelowPath,
  skillGroups,
} from "../listOfQuestions"
import { howLongSince } from "../utils/howLongSince"

/** LearningProgress component */
export function LearningProgress() {
  const { t } = useTranslation()
  const { featureMap, unlockedSkills, log } = useSkills()
  return (
    <HorizontallyCenteredDiv>
      <h1>{t("Practice")}</h1>
      <div>
        {t("Practice.desc")} {t("train.skills.desc")}
      </div>
      <div className="m-6 mx-auto flex flex-wrap justify-center gap-6">
        {skillGroups.map((g) => (
          <SkillGroupCard key={g} partialPath={g} featureMap={featureMap} />
        ))}
      </div>
      {/* <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("Exam")}
      </h2>
      <div>{t("Examine.desc")}</div>
      <Button to="exam" color="red" className="mt-5">
        {t("start exam")}
      </Button> */}
      <h2 className="mb-5 mt-20 border-t-8 border-black/10 pt-2 dark:border-white/10">
        {t("your-learning-progress")}
      </h2>
      <table className="tbl">
        <tbody>
          <QuestionTableHead />
          {allQuestionGeneratorRoutes.map((q) => (
            <QuestionTableRow
              key={q.path}
              generator={q.generator}
              unlocked
              qualified
              strength={averageStrength({
                strengthMap: featureMap,
                set: generatorCallsBelowPath(q.generator.path),
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
          {generatorSetBelowPath("").map((c) => {
            const path = serializeGeneratorCall(c)
            return (
              <QuestionTableRow
                key={path}
                generator={c.generator}
                parameters={c.parameters}
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
  log: Array<LogEntryV1>
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

function LogTableRow({ entry }: { entry: LogEntryV1 }) {
  const { lang } = useTranslation()
  const generatorCall = deserializePath({
    routes: allQuestionGeneratorRoutes,
    path: entry.path,
  })
  if (generatorCall === undefined) return null
  const { generator, parameters, seed } = generatorCall
  const parametersText = parameters
    ? serializeParameters(parameters, generator.expectedParameters)
    : ""
  return (
    <tr>
      <td>
        <PassFailButton
          className="mr-2 inline opacity-50"
          result={entry.result}
        />
        {howLongSince(entry.timestamp, lang)}
      </td>
      <td>
        {generator.name(lang)} {parametersText && <>({parametersText}) </>}[
        <Link
          to={`/${serializeGeneratorCall({
            lang,
            generator,
            parameters,
            seed,
          })}`}
        >
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
  const generatorCalls = generatorCallsBelowPath(partialPath)
  const qualified = generatorCalls.filter(
    (c) => featureMap[serializeGeneratorCall(c)].mastered,
  )
  const done = qualified.length
  const total = generatorCalls.length
  const skillName = t("skill." + partialPath)
  return (
    <>
      <Link
        id={`skill-group-card-${partialPath}`}
        to={`practice/${partialPath}`}
        className="unstyled hover:bg-shading group rounded-lg p-2 text-center hover:cursor-pointer"
      >
        <div className="relative">
          <div
            className={`m-2 aspect-square w-28 transform items-center gap-3 overflow-hidden rounded-full text-center duration-200 group-hover:scale-110 group-hover:ease-in`}
            style={{
              backgroundSize: "cover",
              backgroundImage: `url("${getImageURL(partialPath) ?? ""}")`,
            }}
          ></div>
        </div>
        <div className="mx-auto flex w-max items-center justify-center text-xs font-bold">
          <div>
            {done}/{total} XP
          </div>
        </div>
        <div className="flex items-start justify-center group-hover:font-bold">
          {skillName}
        </div>
      </Link>
      <Tooltip anchorSelect={`#skill-group-card-${partialPath}`} place="bottom">
        {t("Click to practice")}
      </Tooltip>
    </>
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
  generator,
  parameters,
  strength,
  halflife,
  qualified,
  unlocked,
  onMouseOver,
  onMouseOut,
}: {
  generator: QuestionGenerator
  parameters?: Parameters
  strength: number
  halflife?: number
  qualified?: boolean
  unlocked?: boolean
  onMouseOver?: () => void
  onMouseOut?: () => void
}) {
  const { lang } = useTranslation()
  const generatorCallPath = serializeGeneratorCall({ generator, parameters })
  const id =
    generatorCallPath.replaceAll("/", "-") +
    (parameters === undefined ? "-coarse" : "")
  const percentage = Math.round(strength * 100)
  const strengthTooltip = `Estimated strength: ${percentage}%. Decays over time, so practice regularly!${
    halflife
      ? ` (Estimated halflife: ~${Math.round(halflife * 10) / 10} days.)`
      : ""
  }`
  const parametersText = parameters
    ? serializeParameters(parameters, generator.expectedParameters)
    : ""
  return (
    <tr onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <td>
        <Link to={"practice/" + generatorCallPath}>
          {generator.name(lang)}
          {parametersText && ` (${parametersText})`}
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
