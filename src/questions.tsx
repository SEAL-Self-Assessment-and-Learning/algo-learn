import { Random } from "random"
import { FunctionComponent, useMemo } from "react"
import useLocalStorageState from "use-local-storage-state"
import LandauNotation from "./routes/asymptotics/LandauNotation"
import Between from "./routes/asymptotics/Between"
import SortTerms from "./routes/asymptotics/SortTerms"
import SimplifySum from "./routes/asymptotics/SimplifySum"
import { computeStrength, SkillFeatures } from "./utils/memory-model"
import { TFunction } from "i18next"

function min<T>(a: T, b: T) {
  return a < b ? a : b
}

export interface QuestionType
  extends FunctionComponent<{
    variant: string
    seed: string
    t: TFunction
    onResult: (result: "correct" | "incorrect") => void
    regeneratable?: boolean
  }> {
  variants: string[]
  title: string
  path: string
}

/** List of all questions */
export const questions: QuestionType[] = [
  SortTerms as QuestionType,
  LandauNotation as QuestionType,
  SimplifySum as QuestionType,
  Between as QuestionType,
]

/** Return the question corresponding to a path */
export function questionByPath(path: string): QuestionType | undefined {
  for (const e of questions) {
    if (path.startsWith(e.path)) return e
  }
}

/** List of all valid (question,variant) pairs */
export const questionVariants = questions.flatMap((q) =>
  q.variants.map((v) => ({
    question: q,
    variant: v,
    path: q.path + "/" + v,
  }))
)

/** Return the question variant corresponding to a path */
export function questionVariantByPath(path: string) {
  return questionVariants.find((q) => q.path === path)
}

type LogEntry = {
  question: string
  variant: string
  seed: string
  result: "pass" | "fail"
  timestamp: number
}

/**
 * Return a string that uniquely identifies a question
 *
 * @param {LogEntry} entry The log entry whose path we want
 * @param {boolean} omitSeed Whether to omit the seed
 * @returns {string} Path
 */
function PathOfEntry(entry: LogEntry, omitSeed: boolean = false): string {
  return (
    entry.question + "/" + entry.variant + (omitSeed ? "" : "/" + entry.seed)
  )
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
  const [storedlog, setLog] = useLocalStorageState("log", {
    defaultValue: [] as Array<LogEntry>,
    storageSync: true,
  })
  const log = storedlog.filter(
    (e) => questionVariantByPath(e.question + "/" + e.variant) !== undefined
  )

  // const [log, setLog] = useState(initialLogExample as Array<LogEntry>)
  for (let i = 0; i < log.length - 1; i++) {
    console.assert(
      log[i + 1].timestamp > log[i].timestamp,
      "Invariant failed: The log must be sorted, and each timestamp must be unique!"
    )
  }

  /* Compute the features of each skill (e.g., how often pass/fail?) */
  const featureMap = useMemo(() => computeFeatureMap({ log }), [log])

  /* Compute the strength of each skill (number between 0 and 1) */
  const strengthMap = useMemo(
    () => computeStrengthMap({ featureMap }),
    [featureMap]
  )

  const unlockedSkills = useMemo(
    () => computeUnlockedSkills({ strengthMap }),
    [strengthMap]
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
    strengthMap,
    unlockedSkills,
    featureMap,
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
function computeFeatureMap({ log }: { log: Array<LogEntry> }): {
  [path: string]: SkillFeatures
} {
  const featureMap: {
    [path: string]: SkillFeatures
  } = {}
  for (const { path } of questionVariants) {
    featureMap[path] = {
      numPassed: 0,
      numFailed: 0,
      lag: Infinity,
    }
  }

  for (const e of log) {
    const path = PathOfEntry(e, true)

    if (e.result === "pass") {
      featureMap[path].numPassed += 1
    } else {
      console.assert(e.result === "fail")
      featureMap[path].numFailed += 1
    }
    featureMap[path].lag = min(
      featureMap[path].lag,
      (Date.now() - e.timestamp) / 3600 / 24 / 1000
    )
  }
  return featureMap
}

function computeStrengthMap({
  featureMap,
}: {
  featureMap: {
    [path: string]: SkillFeatures
  }
}): {
  [path: string]: { p: number; h: number }
} {
  const strengthMap: {
    [path: string]: { p: number; h: number }
  } = {}
  for (const [path, feature] of Object.entries(featureMap)) {
    strengthMap[path] = computeStrength(feature)
  }
  return strengthMap
}

export function averageStrength({
  strengthMap,
  path,
}: {
  strengthMap: {
    [path: string]: { p: number; h: number }
  }
  path: string
}) {
  const q = questionByPath(path)
  if (q === undefined) return 0

  let avg = 0
  for (const v of q.variants || []) {
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
  rng,
  strengthMap,
  skills = questionVariants.map(({ path }) => path),
  noise = 0,
}: {
  rng: Random
  strengthMap: {
    [path: string]: { p: number; h: number }
  }
  skills: Array<string>
  noise: number
}): string {
  let minPath: string | undefined
  let min = 1
  for (const path of skills) {
    if (!minPath || strengthMap[path].p < min) minPath = path
    min = strengthMap[path].p
  }
  const selection = skills.filter((path) => strengthMap[path].p <= min + noise)
  if (selection.length == 0) throw Error("Cannot find weakest skill")
  return rng.choice(selection) ?? "unreachable"
}

/** Returns a random skill of the highest skill levels ("exam-level") */
export function randomHighestSkill({ rng }: { rng: Random }) {
  return (
    rng.choice([
      "asymptotics/sum/polylog",
      "asymptotics/sum/polylogexp",
      "asymptotics/sort/polylog",
      "asymptotics/sort/polylogexp",
    ]) ?? "unreachable"
  )
}

/**
 * Returns all skills that are already unlocked. A skill unlocks only once all
 * dependencies are above thresholdStrength
 */
export function computeUnlockedSkills({
  strengthMap,
  thresholdStrength = 0.75,
}: {
  strengthMap: {
    [path: string]: { p: number; h: number }
  }
  thresholdStrength?: number
}) {
  // for now, we assume all questions are independent and all variants strictly build on each other.
  const unlockedPaths = []
  for (const q of questions) {
    for (const v of q.variants) {
      const qv = q.path + "/" + v
      unlockedPaths.push(qv)
      if (strengthMap[qv].p < thresholdStrength) break
    }
  }
  return unlockedPaths
}
