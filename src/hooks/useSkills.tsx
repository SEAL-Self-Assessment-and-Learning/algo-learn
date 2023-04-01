import Random from "../utils/random"
import { FunctionComponent, useMemo } from "react"
import useLocalStorageState from "use-local-storage-state"
import { TFunction } from "i18next"

import {
  computeStrength,
  SkillFeatures as BasicSkillFeatures,
  SkillFeaturesAndPredictions as SkillFeatures,
  SkillFeaturesAndPredictions,
} from "../utils/memory-model"
import { min } from "../utils/math"

import { LandauNotation } from "../routes/asymptotics/LandauNotation"
import { Between } from "../routes/asymptotics/Between"
import { SortTerms } from "../routes/asymptotics/SortTerms"
import { SimplifySum } from "../routes/asymptotics/SimplifySum"

export type QuestionProps = {
  variant: string
  seed: string
  t: TFunction
  onResult: (result: "correct" | "incorrect" | "abort") => void
  regenerate?: () => void
}

export interface QuizQuestion {
  path: string
  variants: string[]
  examVariants: string[]
  title: string
  description?: string
  Component: FunctionComponent<QuestionProps>
}

export interface QuizQuestionVariant {
  question: QuizQuestion
  variant: string
}

/** List of all questions */
export const questions: QuizQuestion[] = [
  SortTerms,
  LandauNotation,
  SimplifySum,
  Between,
]

/** Return the question corresponding to a path */
export function questionByPath(path: string): QuizQuestion | undefined {
  for (const e of questions) {
    if (path.startsWith(e.path)) return e
  }
}

/** List of all valid (question,variant) pairs */
export const questionVariants: QuizQuestionVariant[] = questions.flatMap((q) =>
  q.variants.map((v) => ({
    question: q,
    variant: v,
    // path: q.path + "/" + v,
  }))
)

const HIGHEST_SKILLS: QuizQuestionVariant[] = questions.flatMap((q) =>
  q.examVariants.map((v) => ({
    question: q,
    variant: v,
    // path: q.path + "/" + v,
  }))
)

/** Return the path corresponding to a question variant */
export function pathOfQuestionVariant(qv: QuizQuestionVariant): string {
  return qv.question.path + "/" + qv.variant
}

/** Return the question variant corresponding to a path */
export function questionVariantByPath(path: string) {
  return questionVariants.find((qv) =>
    path.startsWith(pathOfQuestionVariant(qv))
  )
}

export type LogEntry = {
  question: string
  variant: string
  seed: string
  result: "pass" | "fail"
  timestamp: number
}

// const initialLogExample = [
//   {
//     question: "asymptotics/sort",
//     variant: "pure",
//     seed: "skkpjd93",
//     result: "pass",
//     timestamp: Date.now() - 24 * 3600 * 1000,
//   },
//   {
//     question: "asymptotics/sort",
//     variant: "start",
//     seed: "jd930jz",
//     result: "fail",
//     timestamp: Date.now() - 400000,
//   },
//   {
//     question: "asymptotics/sort",
//     variant: "start",
//     seed: "skm93js",
//     result: "pass",
//     timestamp: Date.now() - 200000,
//   },
//   {
//     question: "asymptotics/sort",
//     variant: "start",
//     seed: "82sjh9w",
//     result: "pass",
//     timestamp: Date.now() - 100,
//   },
//   {
//     question: "asymptotics/sort",
//     variant: "start",
//     seed: "skkpjd93",
//     result: "pass",
//     timestamp: Date.now() - 29,
//   },
// ]

/** Return the progress of the user */
export function useSkills() {
  // const [storedlog, setLog] = useState(initialLogExample as Array<LogEntry>)
  const [storedlog, setLog] = useLocalStorageState("log", {
    defaultValue: [] as Array<LogEntry>,
    storageSync: true,
  })
  const log = storedlog
    .filter(
      (e) => questionVariantByPath(e.question + "/" + e.variant) !== undefined
    )
    .sort((a, b) => b.timestamp - a.timestamp)
  for (let i = 0; i < log.length - 1; i++) {
    console.assert(
      log[i + 1].timestamp < log[i].timestamp,
      "Invariant failed: The log must be sorted in descending order, and each timestamp must be unique!"
    )
  }

  /* Compute the basic features of each skill (e.g., how often pass/fail?) */
  const basicFeatureMap = computeBasicFeatureMap({ log })

  /* Compute the strength of each skill (number between 0 and 1) */
  const featureMap = useMemo(
    () => computeFeatureMap({ basicFeatureMap }),
    [basicFeatureMap]
  )

  /* Compute  */
  const unlockedSkills = useMemo(
    () => computeUnlockedSkills({ featureMap }),
    [featureMap]
  )

  function appendLogEntry(entry: LogEntry) {
    const newLog = log.slice()
    newLog.push(entry)
    setLog(newLog)
  }

  function clearLog() {
    setLog([])
  }

  return {
    featureMap: featureMap,
    unlockedSkills,
    log,
    appendLogEntry,
    clearLog,
  }
}

/**
 * Computes the feature vector for all question variants
 *
 * @param {object} props
 * @param {LogEntry[]} props.log A user's full history
 * @returns {object} The feature vector
 */
function computeBasicFeatureMap({ log }: { log: Array<LogEntry> }): {
  [path: string]: BasicSkillFeatures
} {
  const qualifyingPasses: { [path: string]: number } = {}
  const featureMap: { [path: string]: BasicSkillFeatures } = {}
  for (const qv of questionVariants) {
    const path = pathOfQuestionVariant(qv)
    qualifyingPasses[path] = 0
    featureMap[path] = {
      qualified: false,
      numPassed: 0,
      numFailed: 0,
      lag: Infinity,
    }
  }

  // We need at least 3 successive passes to unlock a skill;
  // only after this time will the featureMap be computed.
  const minQualifyingPasses = 3

  const now = Date.now()
  for (const e of log.slice().reverse()) {
    const path = e.question + "/" + e.variant
    featureMap[path].lag = min(
      featureMap[path].lag,
      (now - e.timestamp) / 3600 / 24 / 1000
    )
    if (featureMap[path].qualified) {
      if (e.result === "pass") {
        featureMap[path].numPassed += 1
      } else {
        console.assert(e.result === "fail")
        featureMap[path].numFailed += 1
      }
    } else if (qualifyingPasses[path] < minQualifyingPasses) {
      if (e.result === "pass") {
        qualifyingPasses[path] += 1
      } else {
        qualifyingPasses[path] = 0
      }
    }
    if (qualifyingPasses[path] === minQualifyingPasses) {
      featureMap[path].qualified = true
      // featureMap[path].numPassed = Math.max(
      //   featureMap[path].numPassed,
      //   minQualifyingPasses
      // )
    }
  }
  return featureMap
}

/**
 * Computes the strength of each skill
 *
 * @param {object} props
 * @param {object} props.featureMap The feature vector
 * @returns {object} The strength of each skill
 */
function computeFeatureMap({
  basicFeatureMap,
}: {
  basicFeatureMap: {
    [path: string]: BasicSkillFeatures
  }
}): {
  [path: string]: SkillFeatures
} {
  const featureMap: {
    [path: string]: SkillFeatures
  } = {}
  for (const [path, feature] of Object.entries(basicFeatureMap)) {
    featureMap[path] = computeStrength(feature)
  }
  return featureMap
}

/**
 * Given a strengthMap and a path, compute the average strength of all question
 * variants that exist within that path.
 *
 * @param {object} props
 * @param {object} props.strengthMap The strength of each skill
 * @param {string} props.path The path to the skill
 * @returns {number} The average strength of all variants of the skill
 */
export function averageStrength({
  strengthMap,
  path,
}: {
  strengthMap: {
    [path: string]: { p: number; h: number }
  }
  path: string
}): number {
  const q = questionByPath(path)
  if (q === undefined || q.variants.length === 0) return 0

  let avg = 0
  for (const v of q.variants) {
    avg += strengthMap[path + "/" + v].p
  }
  avg /= q.variants.length
  return avg
}

/**
 * Return the weakest skill.
 *
 * @param strengthMap
 * @param skills If provided, only select among these skills
 * @param noise If provided, make the selection noisy using randomness
 */
export function weakestSkill({
  random,
  strengthMap,
  skills = questionVariants.map((qv) => pathOfQuestionVariant(qv)),
  noise = 0.1,
}: {
  random: Random
  strengthMap: {
    [path: string]: { p: number; h: number }
  }
  skills: Array<string>
  noise: number
}): string {
  let minPath: string | undefined
  let min = 2
  for (const path of skills) {
    if (!minPath || strengthMap[path].p < min) {
      minPath = path
    }
    min = strengthMap[path].p
  }
  const selection = skills.filter((path) => strengthMap[path].p <= min + noise)
  if (selection.length == 0) throw Error("Cannot find weakest skill")
  return random.choice(selection)
}

/** Returns a random skill of the highest skill levels ("exam-level") */
export function randomHighestSkill({
  random,
}: {
  random: Random
}): string {
  return pathOfQuestionVariant(random.choice(HIGHEST_SKILLS))
}

/**
 * Returns all skills that are already unlocked. A skill unlocks only once all
 * dependencies are above thresholdStrength
 *
 * @param {object} props
 * @param {object} props.featureMap The feature vector
 * @param {number} props.thresholdStrength The threshold for a skill to be
 *   considered unlocked
 * @returns {string[]} The list of unlocked skills
 */
export function computeUnlockedSkills({
  featureMap,
  thresholdStrength = 0.75,
}: {
  featureMap: {
    [path: string]: SkillFeaturesAndPredictions
  }
  thresholdStrength?: number
}): string[] {
  // for now, we assume all questions are independent and all variants strictly build on each other.
  const unlockedPaths = []
  for (const q of questions) {
    for (const v of q.variants) {
      const qv = q.path + "/" + v
      unlockedPaths.push(qv)
      if (featureMap[qv].p < thresholdStrength || !featureMap[qv].qualified)
        break
    }
  }
  return unlockedPaths
}
