/**
 * This file contains a list of all questions available on the give instance of SEAL.
 * TODO: In future this file should be generated by a script.
 */
import { QuestionCollection } from "@shared/api/QuestionRouter"
// import { ExampleQuestion } from "@shared/question-generators/example/example"
import { Between } from "@shared/question-generators/asymptotics/between"
import { LandauNotation } from "@shared/question-generators/asymptotics/landau"
import { AsymptoticsPreciseLanguage } from "@shared/question-generators/asymptotics/preciseLanguage"
import { SortTerms } from "@shared/question-generators/asymptotics/sort"
import { SimplifySum } from "@shared/question-generators/asymptotics/sum"
import { huffmanCoding } from "@shared/question-generators/huffman-coding/huffmanCoding"
import { ReverseHuffmanCoding } from "@shared/question-generators/huffman-coding/reverseHuffmanCoding.ts"
import { CRT } from "@shared/question-generators/math/crt"
import { modFactor } from "@shared/question-generators/math/modFactorization"
import { ModTricks } from "@shared/question-generators/math/modTricks"
import { NormalForms } from "@shared/question-generators/propositional-logic/normalForms.ts"
import { Satisfiability } from "@shared/question-generators/propositional-logic/satisfiability.ts"
import { queueQuestion } from "@shared/question-generators/Queue/QueueGenerator.ts"
import { RecursionFormula } from "@shared/question-generators/recursion/formula"
import { RecurrenceMaster } from "@shared/question-generators/recursion/recurrenceMaster"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator.ts"
import { Loops } from "@shared/question-generators/time/loops"

export const DEFAULT_IMAGE = new URL("../../assets/images/skill-default.jpg", import.meta.url)

export const collection: QuestionCollection = [
  // {
  //   slug: "example",
  //   name: { de: "Beispiel", en: "Example" },
  //   contents: [ExampleQuestion],
  // },
  {
    slug: "asymptotics",
    name: { de: "Asymptotik", en: "Asymptotics" },
    contents: [AsymptoticsPreciseLanguage, SortTerms, LandauNotation, SimplifySum, Between],
    image: new URL("../front-end/assets/images/skill-asymptotics.jpg", import.meta.url),
  },
  {
    slug: "recursion",
    name: { de: "Rekursion", en: "Recursion" },
    contents: [RecursionFormula, RecurrenceMaster],
    image: new URL("../front-end/assets/images/skill-recursion.jpg", import.meta.url),
  },
  {
    slug: "time",
    name: { de: "Laufzeit", en: "Time" },
    contents: [Loops],
    image: new URL("../front-end/assets/images/skill-time.jpg", import.meta.url),
  },
  {
    slug: "huffmancoding",
    name: { de: "Huffman-Codierung", en: "Huffman-Coding" },
    contents: [huffmanCoding, ReverseHuffmanCoding],
  },
  {
    slug: "queue",
    name: { de: "Queue", en: "Queue" },
    contents: [queueQuestion],
  },
  {
    slug: "stack",
    name: { de: "Stack", en: "Stack" },
    contents: [stackQuestion],
  },
  {
    slug: "propositional-logic",
    name: { de: "Aussagenlogik", en: "Propositional Logic" },
    contents: [Satisfiability, NormalForms],
  },
  {
    slug: "modular-arithmetic",
    name: { de: "Modulare Arithmetik", en: "Modular Arithmetic" },
    contents: [ModTricks, CRT, modFactor],
  },
]

export const oldPathToGenerator = {
  "asymptotics/precise-language": AsymptoticsPreciseLanguage,
  "asymptotics/sort": SortTerms,
  "asymptotics/landau": LandauNotation,
  "asymptotics/sum": SimplifySum,
  "asymptotics/between": Between,
  "recursion/formula": RecursionFormula,
  "recursion/master": RecurrenceMaster,
  "time/loops": Loops,
  "huffmancoding/huffmanCoding": huffmanCoding,
  "stackqueue/stack": stackQuestion,
  "stackqueue/queue": queueQuestion,
}
