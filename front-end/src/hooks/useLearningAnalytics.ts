import { useMemo } from "react"
import { collection } from "@settings/questionsSelection"
import { allParameterCombinations, type Parameters } from "@shared/api/Parameters"
import type { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { min } from "@shared/utils/math"
import type Random from "@shared/utils/random"
import {
  computeStrength,
  type BasicSkillFeatures,
  type SkillFeaturesAndPredictions,
} from "@/utils/memoryModel"
import { useLearningLog, type LogEntryV2 } from "./useLearningLog"

/** Return the progress of the user */
export function useLearningAnalytics() {
  const { log, ...logRest } = useLearningLog()

  /* Compute the basic features of each skill (e.g., how often pass/fail?) */
  const basicFeatureMap = useMemo(() => accumulateLearningLog(log), [log])

  /* Compute the strength of each skill (number between 0 and 1) */
  const featureMap = useMemo(() => computeFeatureMap(basicFeatureMap), [basicFeatureMap])

  const unlockedSkills = useMemo(() => computeUnlockedSkills(featureMap), [featureMap])

  return { featureMap, unlockedSkills, log, ...logRest }
}

/**
 * Computes the feature vector for all question variants
 *
 * @param log User's full learning history
 * @returns The feature vector
 */
function accumulateLearningLog(log: Array<LogEntryV2>) {
  const featureMap: Record<string, BasicSkillFeatures> = {}
  for (const e of log) {
    if (!(e.path in featureMap)) {
      featureMap[e.path] = {
        numPassed: 0,
        numFailed: 0,
        lag: Infinity,
      }
    }
    if (e.result === "pass") featureMap[e.path].numPassed += 1
    else featureMap[e.path].numFailed += 1
    featureMap[e.path].lag = min(featureMap[e.path].lag, (Date.now() - e.timestamp) / 3600 / 24 / 1000)
  }
  return featureMap
}

/**
 * Computes the strength of each skill
 *
 * @param basicFeatureMap The feature vector
 * @returns The strength of each skill
 */
function computeFeatureMap(basicFeatureMap: Record<string, BasicSkillFeatures>) {
  const featureMap: Record<string, SkillFeaturesAndPredictions> = {}
  for (const [path, feature] of Object.entries(basicFeatureMap)) {
    featureMap[path] = computeStrength(feature)
  }
  return featureMap
}

/**
 * Given a strengthMap and a path, compute the average strength of all question
 * variants that exist within that path.
 *
 * @param strengthMap The strength of each skill
 * @param set The set of generator/parameter combinations to take the
 *   average over
 * @returns The average strength of all variants in the set
 */
// export function averageStrength(
//   strengthMap: Record<string, { p: number; h: number }>,
//   set: Array<{ generator: QuestionGenerator; parameters: Parameters }>,
// ) {
//   if (set.length === 0) return 0

//   let avg = 0
//   for (const { generator, parameters } of set) {
//     avg += strengthMap[serializeGeneratorCall({ generator, parameters })].p
//   }
//   return avg / set.length
// }

/**
 * Return a list of question variants sorted by strength from lowest to highest
 *
 * @param props
 * @param props.random The random number generator
 * @param props.featureMap The feature map
 * @param props.generatorCalls The list of question variants that should be
 *   sorted. Note that this list will be sorted in-place.
 * @returns The questionVariants list
 */
export function sortByStrength({
  random,
  featureMap,
  generatorCalls,
}: {
  random?: Random
  featureMap: Record<string, { p: number; h: number }>
  generatorCalls: Array<{ generator: QuestionGenerator; parameters: Parameters }>
}): Array<{
  generator: QuestionGenerator
  parameters: Parameters
}> {
  random?.shuffle(generatorCalls) // If random was provided, shuffle to break ties
  generatorCalls.sort(
    (a, b) => featureMap[serializeGeneratorCall(a)]?.p ?? 0 - featureMap[serializeGeneratorCall(b)]?.p,
  )
  return generatorCalls
}

/**
 * Returns all skills that are already unlocked. A skill unlocks only once all
 * dependencies are above thresholdStrength
 *
 * @param featureMap The feature vector
 * @param thresholdStrength The threshold for a skill to be considered unlocked
 * @returns The list of unlocked skills
 */
export function computeUnlockedSkills(
  featureMap: Record<string, SkillFeaturesAndPredictions>,
  thresholdStrength = 0.75,
): string[] {
  // for now, we assume all question generators are independent and all variants strictly build on each other.
  const unlockedPaths = []
  for (const generator of collection.flatMap((x) => x.contents)) {
    for (const parameters of allParameterCombinations(generator.expectedParameters)) {
      const newPath = serializeGeneratorCall({ generator, parameters })
      unlockedPaths.push(newPath)
      if (featureMap[newPath]?.p ?? 0 < thresholdStrength) break
    }
  }
  return unlockedPaths
}
