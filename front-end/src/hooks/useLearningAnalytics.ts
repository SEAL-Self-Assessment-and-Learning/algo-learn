import { useMemo } from "react"
import { collection } from "@settings/questionsSelection"
import { allParameterCombinations, Parameters } from "@shared/api/Parameters"
import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { min } from "@shared/utils/math"
import Random from "@shared/utils/random"
import { BasicSkillFeatures, computeStrength, SkillFeaturesAndPredictions } from "@/utils/memoryModel"
import { LogEntryV2, useLearningLog } from "./useLearningLog"

/** Return the progress of the user */
export function useLearningAnalytics() {
  const { log, ...logRest } = useLearningLog()
  const basicFeatureMap = useMemo(() => accumulateLearningLog(log), [log])
  const featureMap = useMemo(() => computeFeatureMap(basicFeatureMap), [basicFeatureMap])
  const unlockedSkills = useMemo(() => computeUnlockedSkills(featureMap), [featureMap])
  const summaryStrength = useMemo(() => summaryStrengthOfGenerators(featureMap), [featureMap])
  return { featureMap, summaryStrength, unlockedSkills, log, ...logRest }
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
    const path = e.path.split("/").slice(0, -1).join("/")
    if (!(path in featureMap)) {
      featureMap[path] = {
        numPassed: 0,
        numFailed: 0,
        lag: Infinity,
      }
    }
    if (e.result === "pass") featureMap[path].numPassed += 1
    else featureMap[path].numFailed += 1
    featureMap[path].lag = min(featureMap[path].lag, (Date.now() - e.timestamp) / 3600 / 24 / 1000)
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
 * Computes the summary strength for each question generator in the collection
 *
 * @param featureMap The feature vector
 * @returns The average strength of all variants for each question generator
 */
function summaryStrengthOfGenerators(featureMap: Record<string, SkillFeaturesAndPredictions>) {
  const rec: Record<string, number> = {}
  for (const generator of collection.flatMap((x) => x.contents)) {
    rec[generator.id] = averageStrengthOfSet(
      featureMap,
      allParameterCombinations(generator.expectedParameters).map((parameters) => ({
        generator,
        parameters,
      })),
    )
  }
  return rec
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
export function averageStrengthOfSet(
  strengthMap: Record<string, { p: number; h: number }>,
  set: Array<{ generator: QuestionGenerator; parameters: Parameters }>,
) {
  if (set.length === 0) return 0

  let avg = 0
  for (const { generator, parameters } of set) {
    avg += strengthMap[serializeGeneratorCall({ generator, parameters })]?.p ?? 0
  }
  return avg / set.length
}

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
    (a, b) =>
      featureMap[serializeGeneratorCall(a)]?.p ?? 0 - featureMap[serializeGeneratorCall(b)]?.p ?? 0,
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
