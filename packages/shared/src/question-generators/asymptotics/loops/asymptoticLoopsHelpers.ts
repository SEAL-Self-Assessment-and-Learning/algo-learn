import type { PseudoCode, PseudoCodeState, PseudoCodeString } from "../../../utils/pseudoCodeUtils.ts"
import type Random from "../../../utils/random.ts"
import type { SimpleAsymptoticTerm } from "../asymptoticsUtils.ts"

export type LoopScenario = {
  id: string
  code: PseudoCode
  complexity: SimpleAsymptoticTerm
  functionName: string
  variable: string
}

export type ScenarioFactory = (random: Random, difficulty: number) => LoopScenario

export type AdditiveStep = { kind: "add"; step: number; label: string; weight: number }
export type MultiplicativeStep = { kind: "mul"; factor: number; label: string; weight: number }
export type StepVariant = AdditiveStep | MultiplicativeStep

export const asArray = (v: string): PseudoCodeString => [{ variable: v }]

export const powerString = (variable: string, exponent: number): PseudoCodeString =>
  exponent === 1 ? asArray(variable) : [{ variable }, "^", exponent.toString()]

export const assignmentState = (assignment: string, value: PseudoCodeString): PseudoCodeState => ({
  state: { assignment, value },
})

export const incrementState = (variable: string, step: number | string = 1): PseudoCodeState => ({
  state: { assignment: variable, value: [{ variable }, "+", step.toString()] },
})

export const breakState = (): PseudoCodeState => ({ state: { breakState: true } })

export const returnState = (variable: string): PseudoCodeState => ({
  state: { returnValue: [{ variable }] },
})

export const pickWeightedVariant = <T extends { weight: number }>(random: Random, items: T[]): T => {
  const expanded: T[] = []
  for (const item of items) {
    for (let i = 0; i < item.weight; i++) expanded.push(item)
  }
  return random.choice(expanded)
}
