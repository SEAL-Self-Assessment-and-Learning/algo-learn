import type { ProductTerm } from "@shared/question-generators/asymptotics/asymptoticsUtils.ts"
import type { PseudoCode } from "@shared/utils/pseudoCodeUtils.ts"

export type LoopAsymptoticVariant = {
  code: PseudoCode
  runtime: ProductTerm
}
