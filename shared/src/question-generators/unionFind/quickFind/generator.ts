import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { QuickFind } from "@shared/question-generators/unionFind/quickFind/algorithm.ts"
import { unionFindStartQuestion } from "@shared/question-generators/unionFind/utilsStart.ts"
import Random from "@shared/utils/random"
import { tFunctional, Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Quick-Find",
    description: "Determine the Quick-Find state after Union operation",
    task: `A state of the Quick-Find data structure is given as the following array: \n{{0}}\n We call \`Union({{1}}, {{2}})\`. Provide the resulting state. {{3}}
      We assume that the operation **Union(**$i$**,** $j$**)** always sets the value specified by **Find(**$i$**)** to the value specified by **Find(**$j$**)**.`,
  },
  de: {
    name: "Quick-Find",
    description: "Bestimme den Quick-Find-Zustand nach Union-Operation",
    task: `Ein Zustand der Quick-Find Datenstruktur ist als folgendes Array gegeben: \n{{0}}\n Wir rufen \`Union({{1}}, {{2}})\` auf. Gib den Zustand an, der dadurch entsteht. {{3}}
      Wir nehmen an, dass die Operation **Union(**$i$**,** $j$**)** immer den durch **Find(**$i$**)** spezifizierten Wert auf den von **Find(**$j$**)** spezifierten Wert setzt.`,
  },
}

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
    const permalink = serializeGeneratorCall({
      generator: QuickFindGenerator,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    // for quickFind size of 6 or 7 is enough
    const unionSize = random.int(6, 7)
    const union = new QuickFind(unionSize)

    return {
      question: unionFindStartQuestion({ random, union, unionSize, lang, permalink, translations }),
    }
  },
}
