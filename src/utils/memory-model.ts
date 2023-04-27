/**
 * Uses the Half-Life Regression (HLR) memory model to determine the probability
 * of remembering a given skill
 *
 * TODO:
 *
 * - Weights are currently hard-coded. We should eventually learn them from data.
 *
 * References:
 *
 * - https://github.com/Networks-Learning/spaced-selection/blob/master/code/simulation.py
 * - https://blog.duolingo.com/how-we-learn-how-you-learn/
 */

export type SkillFeatures = {
  mastered: boolean // whether we think this skill has been mastered at least once
  numPassed: number // number of times the user passed the question
  numFailed: number // number of times the user failed the question
  lag: number // time since the last interaction in days
  n0?: number // inherent difficulty of the question
}

export interface SkillFeaturesAndPredictions extends SkillFeatures {
  h: number // half-life of the skill in days
  p: number // probability of remembering the skill
}

// various constraints on parameters and outputs
const MIN_HALF_LIFE = 1.0 / (24 * 60) // 1 minutes (in days)
const MAX_HALF_LIFE = 90 // 3 months  (in days)
// const FIVE_MINUTES = 5 * 60 // 5 minutes (in secs)
// const SEC_IN_DAY = 24 * 60 * 60

export function hclip(h: number): number {
  return Math.min(Math.max(h, MIN_HALF_LIFE), MAX_HALF_LIFE)
}

export function pclip(p: number): number {
  return Math.min(Math.max(p, 0.0001), 0.9999)
}

// These weights are set, such that 3 correct answers and
// 0 wrong answers give a half-life of 14 days
const RIGHT = 0.932118
const WRONG = -0.8
const BIAS = 1.011

/**
 * Given the number of times the user passed and failed the question, determine
 * the half-life of the skill in days
 *
 * @param numPassed - The number of times the user passed the question
 * @param numFailed - The number of times the user failed the question
 * @param n0 - The inherent difficulty of the question
 * @returns The half-life of the skill in days
 */
export function halflife(
  numPassed: number,
  numFailed: number,
  n0: number = 0
): number {
  const log_halflife = numPassed * RIGHT + numFailed * WRONG + n0 + BIAS
  const h = hclip(2 ** log_halflife)
  return h
}

/**
 * Given the features of a user/skill pair and the time since the last
 * interaction in minutes, determine the strength of the skill using HLR
 *
 * @param f - The features from which we compute the strength
 * @returns The features and the strength
 */
export function computeStrength(f: SkillFeatures): SkillFeaturesAndPredictions {
  const h = halflife(f.numPassed, f.numFailed, f.n0)
  const p = pclip(2 ** (-f.lag / h))
  return { h, p, ...f }
}
