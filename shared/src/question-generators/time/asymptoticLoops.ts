import type { FreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { sampleLoopStars } from "@shared/question-generators/time/utilsStars/general"
import { stringifyPseudoCode } from "@shared/utils/pseudoCodeUtils"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

const translations: Translations = {
  en: {
    name: "Loops (Asymptotic)",
    description: "Determine the runtime of a loop",
    text: "{{0}} Let $f(n)$ be the runtime of loop above. Determine the $f(n)$ in $\\Theta$-Notation.",
  },
  de: {
    name: "Schleifen (Asymptotisch)",
    description: "Bestimme die Laufzeit einer Schleife",
    text: "{{0}} Sei $f(n)$ die Laufzeit der Schleife oben. Bestimme das $f(n)$ in $\\BigTheta$-Notation.",
  },
}

export const LoopsAsymptotic: QuestionGenerator = {
  id: "loopsa",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  languages: ["en", "de"],
  expectedParameters: [
    {
      type: "string",
      name: "variant",
      allowedValues: ["simpleExact"],
    },
  ],
  generate(lang, parameters, seed) {
    const permalink = serializeGeneratorCall({
      generator: LoopsAsymptotic,
      lang,
      parameters,
      seed,
    })

    const random = new Random(seed)
    const { functionText } = sampleLoopStars(random)

    const question: FreeTextQuestion = {
      type: "FreeTextQuestion",
      name: LoopsAsymptotic.name(lang),
      text: t(translations, lang, "text", [stringifyPseudoCode(functionText)]),
      path: permalink,
    }
    return { question }
  },
}
