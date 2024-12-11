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
    What is a possible solution for $x$?
    {{2}}`,
    checkFormat: "Please only enter a number",
  },
  de: {
    name: "Lineares Gleichungssystem",
    description: "Löse ein lineares Gleichungssystem",
    text: `Löse $Ax=b$ für $x$, gegeben $A$ und $b$ wie folgt:
    \\[ A={{0}} \\quad b={{1}} \\]
    Bitte gib eine mögliche Lösung $\\forall x_i \\in x$ an.
    {{2}}`,
    checkFormat: "Bitte gib nur eine Zahl ein",
  },
}

export const axb: QuestionGenerator = {
  id: "axbdir",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [],

  generate: (lang, parameters, seed) => {
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
