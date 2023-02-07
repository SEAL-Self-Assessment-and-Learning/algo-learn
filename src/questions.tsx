import random from "random"
import { useMemo } from "react"
import useLocalStorageState from "use-local-storage-state"
import { SimplifySum, SortTerms } from "./routes/asymptotics"

function min<T>(a: T, b: T) {
  return a < b ? a : b
}
/**
 * List of all questions
 */
export const questions = [SimplifySum, SortTerms]
// RelateToSum

/**
 * List of all valid (question,variant) pairs
 */
export const questionVariants = questions.flatMap((q) =>
  q.variants.map((v) => ({
    question: q,
    variant: v,
    path: q.path + "/" + v,
  }))
)

export function questionByPath(
  path: string
): typeof SimplifySum | typeof SortTerms | undefined {
  for (const e of questions) {
    if (path.startsWith(e.path)) return e
  }
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
 * @param {LogEntry} entry the log entry whose path we want
 * @param {boolean} omitSeed whether to omit the seed
 * @returns {string} path
 */
function PathOfEntry(entry: LogEntry, omitSeed: boolean = false): string {
  return (
    entry.question + "/" + entry.variant + (omitSeed ? "" : "/" + entry.seed)
  )
}

const initialLogExample = [
  {
    question: "asymptotics/sort",
    variant: "pure",
    seed: "skkpjd93",
    result: "pass",
    timestamp: Date.now() - 24 * 3600 * 1000,
  },
  {
    question: "asymptotics/sort",
    variant: "start",
    seed: "jd930jz",
    result: "fail",
    timestamp: Date.now() - 400000,
  },
  {
    question: "asymptotics/sort",
    variant: "start",
    seed: "skm93js",
    result: "pass",
    timestamp: Date.now() - 200000,
  },
  {
    question: "asymptotics/sort",
    variant: "start",
    seed: "82sjh9w",
    result: "pass",
    timestamp: Date.now() - 100,
  },
  {
    question: "asymptotics/sort",
    variant: "start",
    seed: "skkpjd93",
    result: "pass",
    timestamp: Date.now() - 29,
  },
]

/**
 * Return the progress of the user
 */
export function useSkills() {
  const [log, setLog] = useLocalStorageState("log", {
    defaultValue: [] as Array<LogEntry>,
    storageSync: true,
  })
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

type SkillFeatures = { numPassed: number; numFailed: number; lag: number }

/**
 * Computes the feature vector for all question variants
 * @param {Object} props
 * @param {Array<LogEntry>} props.log a user's full history
 * @returns {Object} the feature vector
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

/**
 * Given the features of a user/skill pair and the time since the last
 * interaction in minutes, determine the strength of the skill using Leitner's algorithm
 * @param {Object} features the features from which we compute the strength
 * @param {number} features.numPassed the number of times the user passed the question
 * @param {number} features.numFailed the number of times the user failed the question
 * @param {number} features.lag the time since the last interaction in days
 * @returns {number} the strength as determined by Leitner's algorithm
 * See https://blog.duolingo.com/how-we-learn-how-you-learn/
 */
export function computeStrength({
  numPassed,
  numFailed,
  lag,
}: SkillFeatures): number {
  // Leitner's algorithm assumes that the skill decays in this many days to 50%:
  const halfLife = 2 ** ((numPassed - numFailed - 3) / 2)
  // (In general, the exponent can be any linear function of the features.)

  // This is the probability of remembering the skill after lag many days:
  const p = 2 ** (-lag / halfLife)

  return p
}

function computeStrengthMap({
  featureMap,
}: {
  featureMap: {
    [path: string]: SkillFeatures
  }
}): {
  [path: string]: number
} {
  const strengthMap: {
    [path: string]: number
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
    [path: string]: number
  }
  path: string
}) {
  const q = questionByPath(path)
  if (q === undefined) return 0

  let avg = 0
  for (const v of q.variants || []) {
    avg += strengthMap[path + "/" + v]
  }
  avg /= q.variants.length
  return avg
}

/** Return the weakest skill.
 * @param strengthMap
 * @param skills if provided, only select among these skills
 * @param noise if provided, make the selection noisy using randomness
 */
export function weakestSkill({
  strengthMap,
  skills = questionVariants.map(({ path }) => path),
  noise = 0,
}: {
  strengthMap: {
    [path: string]: number
  }
  skills: Array<string>
  noise: number
}): string {
  let minPath: string | undefined
  let min = 1
  for (const path of skills) {
    if (!minPath || strengthMap[path] < min) minPath = path
    min = strengthMap[path]
  }
  const selection = skills.filter((path) => strengthMap[path] <= min + noise)
  if (selection.length == 0) throw Error("Cannot find weakest skill")
  return random.choice(selection) ?? "unreachable"
}

/**
 * Returns a random skill of the highest skill levels ("exam-level")
 */
export function randomHighestSkill() {
  return (
    random.choice([
      "asymptotics/sum/polylog",
      "asymptotics/sum/polylogexp",
      "asymptotics/sort/polylog",
      "asymptotics/sort/polylogexp",
    ]) ?? "unreachable"
  )
}

/**
 * returns all skills that are already unlocked. A skill unlocks only once all dependencies are above thresholdStrength
 */
export function computeUnlockedSkills({
  strengthMap,
  thresholdStrength = 0.75,
}: {
  strengthMap: {
    [path: string]: number
  }
  thresholdStrength?: number
}) {
  // for now, we assume all questions are independent and all variants strictly build on each other.
  const unlockedPaths = []
  for (const q of questions) {
    for (const v of q.variants) {
      const qv = q.path + "/" + v
      unlockedPaths.push(qv)
      if (strengthMap[qv] < thresholdStrength) break
    }
  }
  return unlockedPaths
}
