import { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { QuickFind } from "@shared/question-generators/unionFind/quickFind/quickFindAlgorithm.ts"
import {
  unionOneBlocksCombineNone,
  unionOneOrTwoBlocksCombineOne,
  unionTwoBlocksCombineBoth,
  unionTwoBlocksCombineNone,
  unionTwoBlocksCombineSame,
} from "@shared/question-generators/unionFind/quickFind/utils.ts"
import { checkFormatArray } from "@shared/utils/checkFormatStandard.ts"
import { feedbackArray } from "@shared/utils/feedbackStandard.ts"
import Random from "@shared/utils/random.ts"
import { t, tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "QuickFind",
    description: "Running the Union-Find algorithm with QuickFind",
    task: "Below is a state of the Quick-Find data structure. \n{{0}}\n We call **Union({{1}}, {{2}})**. Provide the state that results from this.",
    explanationUnion:
      "We assume that the operation **Union(**$i$**,** $j$**)** always sets the value specified by **Find(**$i$**)** to the value specified by **Find(**$j$**)**.",
  },
  de: {
    name: "QuickFind",
    description: "Ausführen des Union-Find-Algorithmus mit QuickFind",
    task: "Unten abgebildet ist ein Zustand der Quick-Find Datenstruktur.\n{{0}}\n Wir rufen **Union({{1}}, {{2}})** auf. Gib den Zustand, der dadurch entsteht, an.",
    explanationUnion:
      "Wir nehmen an, dass die Operation **Union(**$i$**,** $j$**)** immer den durch **Find(**$i$**)** spezifizierten Wert auf den von **Find(**$j$**)** spezifierten Wert setzt.",
  },
}

type UnionCases =
  | "twoBlocksCombineBoth"
  | "oneOrTwoBlocksCombineOne"
  | "twoBlocksCombineNone"
  | "twoBlocksCombineSame"
  | "oneBlockCombineNone"

export const QuickFindGenerator: QuestionGenerator = {
  id: "ufqf",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["union-find", "quick-find"],
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["start"],
    },
  ],

  generate(lang, parameters, seed) {
    const random = new Random(seed)

    // Test --> 7 124, 8 203, 9 266, 10 224, 11 131, 12 47, 13 5, 14 0
    const unionSize = random.intNormal(7, 14, 10, 1.5)

    const union = new QuickFind(unionSize)

    const unionCase: UnionCases = random.weightedChoice([
      ["twoBlocksCombineBoth", 0.25],
      ["oneOrTwoBlocksCombineOne", 0.5],
      ["twoBlocksCombineNone", 0.1],
      ["twoBlocksCombineSame", 0.05],
      ["oneBlockCombineNone", 10000000.1],
    ])

    const unionCaseFunctions = {
      twoBlocksCombineBoth: unionTwoBlocksCombineBoth,
      oneOrTwoBlocksCombineOne: unionOneOrTwoBlocksCombineOne,
      twoBlocksCombineNone: unionTwoBlocksCombineNone,
      twoBlocksCombineSame: unionTwoBlocksCombineSame,
      oneBlockCombineNone: unionOneBlocksCombineNone,
    }

    const { gapField, gapOperationValues } = unionCaseFunctions[unionCase]({
      random,
      union,
      unionSize,
    })

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: QuickFindGenerator.name(lang),
      path: serializeGeneratorCall({
        generator: QuickFindGenerator,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "task", [
        gapField,
        gapOperationValues[0].toString(),
        gapOperationValues[1].toString(),
      ]),
      bottomText: t(translations, lang, "explanationUnion"),
      checkFormat: checkFormatArray({ lang, values: "int" }).display,
      feedback: feedbackArray({ solution: union.getArray().map((x) => x.toString()) }).normal,
    }

    return {
      question,
      testing: {
        union,
        gapField,
        gapOperationValues,
      },
    }
  },
}
