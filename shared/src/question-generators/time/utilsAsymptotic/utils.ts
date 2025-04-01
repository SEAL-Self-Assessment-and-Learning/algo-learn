import {
  createProductTerm,
  type ProductTerm,
} from "@shared/question-generators/asymptotics/asymptoticsUtils.ts"
import { printStarsNew, type PseudoCode } from "@shared/utils/pseudoCodeUtils.ts"
import type Random from "@shared/utils/random.ts"

export type LoopAsymptoticVariant = {
  code: PseudoCode
  runtime: ProductTerm
}
export const runtimeLinear = createProductTerm({
  coefficient: 1,
  polyexponent: 1,
})
export const runtimeSquare = createProductTerm({
  coefficient: 1,
  polyexponent: 2,
})
export const finalValue = [{ variable: "n" }, { variable: "m" }, { variable: "p" }, { variable: "q" }]
export const iterator = [{ variable: "i" }, { variable: "j" }, { variable: "k" }, { variable: "l" }]
export const printStatement = (random: Random, iterDepth: number) =>
  random.choice([
    printStarsNew(random.int(1, 3)),
    {
      state: {
        print: [iterator[iterDepth]],
      },
    },
  ])
