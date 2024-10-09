import { QuestionGenerator } from "@shared/api/QuestionGenerator.ts"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter.ts"
import { generateVariantStartAxb } from "@shared/question-generators/math/linearAlgebra/axb/start.ts"
import Random from "@shared/utils/random.ts"
import { tFunctional, Translations } from "@shared/utils/translations.ts"

const translations: Translations = {
  en: {
    name: "Linear System of Equations",
    description: "Solve a linear system of equations",
    text: `Solve $Ax=b$ for $x$, given $A$ and $b$ as follows:
    \\[ A={{0}} \\quad b={{1}}\\]
    Please provide a possible solution $\\forall x_i \\in x$.
    {{2}}
    Future: Let the input be a vector to fill out (maybe)`,
    checkFormat: "Please only enter a number",
  },
  de: {
    name: "Lineares Gleichungssystem",
    description: "Löse ein lineares Gleichungssystem",
    text: "blabla",
  },
}

export const axb: QuestionGenerator = {
  id: "axbdir",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [],

  generate: (lang, parameters, seed) => {
    // first create a permalink for the question
    const permalink = serializeGeneratorCall({
      generator: axb,
      lang,
      parameters,
      seed,
    })
    const random = new Random(seed)

    return generateVariantStartAxb(translations, random, lang, permalink)
  },
}
