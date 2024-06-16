import { useMemo } from "react"
import { allQuestionVariantPaths } from "@/listOfQuestions"
import { LogEntryV2, useLearningLog } from "./useLearningLog"

/** The number of instances that need to be passed to "master" a question variant */
export const masteryThreshold = 3

/** The number of days after which a question variant is considered "decaying" */
export const decayDays = 30
const decayMilliseconds = decayDays * 24 * 60 * 60 * 1000

/** The learning phase of a question variant
 * - "mastered": user has passed the most recent `masteryThreshold` interactions
 * - "decaying": user mastered it before, but not refreshed it for a long time
 * - "learning": the question variant is available for practice, but has not been mastered
 * - "locked": not all dependencies are fulfilled
 */
export type LearningPhase = "mastered" | "decaying" | "learning" | "locked"

/**
 * For each variant of a question generator, we compute an object of the type below.
 */
export type LearningAnalytics = {
  /* Timestamp of the last interaction, or undefined if none */
  lastInteraction?: number

  /* Learning status of the question variant */
  phase: LearningPhase
}

/**
 * Compare two learning statuses. Earlier statuses need to be practiced first.
 * For example, decaying skill should be practiced before other available skill.
 * @param a First status
 * @param b Second status
 * @returns A negative number if a is less than b, a positive number if a is greater than b, and 0 if a is equal to b
 */
export function comparePhase(a: LearningPhase, b: LearningPhase) {
  return learningPhaseOrder.indexOf(a) - learningPhaseOrder.indexOf(b)
}
const learningPhaseOrder: LearningPhase[] = ["decaying", "learning", "locked", "mastered"]

/** Return the progress of the user */
export function useLearningAnalytics() {
  const { log, ...logRest } = useLearningLog()
  const featureMap: Record<string, LearningAnalytics> = useMemo(() => accumulateLearningLog(log), [log])
  return { featureMap, log, ...logRest }
}

/**
 * Computes the feature vector for all question variants
 *
 * @param log User's full learning history
 * @returns The feature vector
 */
function accumulateLearningLog(log: Array<LogEntryV2>) {
  const D: Record<string, LearningAnalytics & { log: Array<LogEntryV2> }> = {}
  for (const path of allQuestionVariantPaths)
    D[path] = {
      phase: "learning",
      log: [],
    }
  for (const e of log) {
    // remove the seed from the path:
    const path = e.path.split("/").slice(0, -1).join("/")
    if (path in D === false) {
      console.log(`Info: Unknown question variant path found in learning log: '${path}'`)
      continue
    }
    if (D[path].log.length < masteryThreshold) D[path].log.push(e)
    D[path].lastInteraction = D[path].lastInteraction ?? e.timestamp
  }
  for (const path of allQuestionVariantPaths) {
    if (D[path].log.length >= masteryThreshold && D[path].log.every((e) => e.result === "pass")) {
      const lastInteraction = D[path].lastInteraction
      if (lastInteraction === undefined)
        throw new Error("lastInteraction is undefined, even though it should be set")
      if (Date.now() - lastInteraction < decayMilliseconds) D[path].phase = "mastered"
      else D[path].phase = "decaying"
    }
  }
  return D
}
