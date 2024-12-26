import {
  minimalMultipleChoiceFeedback,
  MultipleChoiceQuestion,
  QuestionGenerator,
} from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { getResolutionTerms, Literal } from "@shared/utils/propositionalLogic.ts"
// import { variableNames } from "@shared/question-generators/propositional-logic/utils.ts"
// import { Literal } from "@shared/utils/propositionalLogic.ts"
// import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

// import {getResolutionTerms, Literal} from "@shared/utils/propositionalLogic.ts";

const translations: Translations = {
  en: {
    name: "Resolution",
    description: "Resolve clauses to prove logical consistency.",
    text: `Given the following sets of disjunction terms: 
    \\[ {{0}} \\]
    Which of the following disjunction terms can be reached with **at most** $ {{1}} $ step(s)?`,
  },
  de: {},
}

export const Resolution: QuestionGenerator = {
  id: "resolution",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: [
    "resolution",
    "boolean logic",
    "propositional logic",
    "propositional calculus",
    "satisfiability",
  ],
  license: "MIT",
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "rounds",
      description: tFunctional(translations, "size"),
      type: "integer",
      min: 1,
      max: 3,
    },
    {
      name: "size",
      description: tFunctional(translations, "size"),
      type: "integer",
      min: 3,
      max: 5,
    },
  ],

  generate: (lang = "en", parameters, seed) => {
    const permalink = serializeGeneratorCall({
      generator: Resolution,
      lang,
      parameters,
      seed,
    })
    // const random = new Random(seed)

    const rounds = (parameters.rounds ?? 2) as number
    // const numVars = (parameters.size ?? 4) as number

    // const disjunctionTerms = generateDisjunctionTerms({ random, numVars })

    const AT = new Literal("A")
    const BT = new Literal("B")
    const CT = new Literal("C")
    const DT = new Literal("D")
    const ET = new Literal("E")
    const AF = new Literal("A", true)
    const BF = new Literal("B", true)
    const CF = new Literal("C", true)
    const DF = new Literal("D", true)
    const EF = new Literal("E", true)
    //
    const dt = [[AT, DT], [AT, DT, BF], [AT, CT, DT, ET], [CF], [BT, CT, DF, AF], [EF, DT, CF, BF]]
    const dtl = getResolutionTerms(dt, 2)
    console.log(dtl.length)

    const question: MultipleChoiceQuestion = {
      type: "MultipleChoiceQuestion",
      path: permalink,
      name: Resolution.name(lang),
      text: t(translations, lang, "text", ["a", rounds.toString()]),
      answers: ["as"],
      feedback: minimalMultipleChoiceFeedback({ correctAnswerIndex: [1] }),
    }

    return { question }
  },
}

// function generateDisjunctionTerms({
//   random,
//   numVars,
// }: {
//   random: Random
//   numVars: number
// }): Literal[][] {
//   const varNames = random.choice(variableNames)
//   const numDisjunctionTerms = random.int(4, 7)
//   const [tVars, fVars] = [false, true].map((negated) =>
//     varNames.slice(0, numVars).map((x) => new Literal(x, negated)),
//   )
//
//   return []
// }
