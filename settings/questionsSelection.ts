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
import { HeapNeighbours } from "@shared/question-generators/heap/generatorNeighbours.ts"
import { HeapOperations } from "@shared/question-generators/heap/generatorOperations.ts"
import { HeapVerifying } from "@shared/question-generators/heap/generatorVerify.ts"
import { huffmanCoding } from "@shared/question-generators/huffman-coding/huffmanCoding"
import { CRT } from "@shared/question-generators/math/crt"
import { axb } from "@shared/question-generators/math/linearAlgebra/axb/axbGen.ts"
import { determinant } from "@shared/question-generators/math/linearAlgebra/determinant/det.ts"
import { modFactor } from "@shared/question-generators/math/modFactorization"
import { ModTricks } from "@shared/question-generators/math/modTricks"
import { MinimizePropositionalLogic } from "@shared/question-generators/propositional-logic/minimize.ts"
import { NormalForms } from "@shared/question-generators/propositional-logic/normalForms.ts"
import { Satisfiability } from "@shared/question-generators/propositional-logic/satisfiability.ts"
import { queueQuestion } from "@shared/question-generators/Queue/QueueGenerator.ts"
import { RecursionFormula } from "@shared/question-generators/recursion/formula"
import { RecurrenceMaster } from "@shared/question-generators/recursion/recurrenceMaster"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator.ts"
import { Loops } from "@shared/question-generators/time/loops"
import { QuickFindGenerator } from "@shared/question-generators/unionFind/quickFind/generatorQF"

export const DEFAULT_IMAGE = new URL("../../assets/images/skill-default.jpg", import.meta.url)

export const collection: QuestionCollection = [
  // {
  //   slug: "example",
  //   name: { de: "Beispiel", en: "Example" },
  //   contents: [ExampleQuestion],
  // },

  {
    slug: "propositional-logic",
    name: { de: "Aussagenlogik", en: "Propositional Logic" },
    contents: [Satisfiability, NormalForms, MinimizePropositionalLogic],
  },
  {
    slug: "modular-arithmetic",
    name: { de: "Modulare Arithmetik", en: "Modular Arithmetic" },
    contents: [ModTricks, CRT, modFactor],
  },
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
    slug: "stack",
    name: { de: "Stacks und Queues", en: "Stacks and Queues" },
    contents: [stackQuestion, queueQuestion],
  },
  {
    slug: "heap",
    name: { de: "Heaps", en: "Heaps" },
    contents: [HeapOperations, HeapVerifying, HeapNeighbours],
  },
  {
    slug: "union-find",
    name: { de: "Union-Find", en: "Union-Find" },
    contents: [QuickFindGenerator],
  },
  {
    slug: "huffmancoding",
    name: { de: "Huffman-Codierung", en: "Huffman-Coding" },
    contents: [huffmanCoding],
  },
  {
    slug: "matrix",
    name: { de: "Matrix", en: "Matrix" },
    contents: [determinant, axb],
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
