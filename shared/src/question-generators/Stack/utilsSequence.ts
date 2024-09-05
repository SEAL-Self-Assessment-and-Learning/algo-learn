import { FreeTextQuestion } from "@shared/api/QuestionGenerator.ts"
import { Stack } from "@shared/question-generators/Stack/Stack.ts"
import { stackQuestion } from "@shared/question-generators/Stack/StackGenerator.ts"
import Random from "@shared/utils/random.ts"
import { t, Translations } from "@shared/utils/translations.ts"

export function generateVariantSequence(
  lang: "de" | "en",
  random: Random,
  permalink: string,
  translations: Translations,
) {
  const { operations } = generateOperationsVariantSequence(random)

  const question: FreeTextQuestion = {
    type: "FreeTextQuestion",
    name: stackQuestion.name(lang),
    path: permalink,
    text: t(translations, lang, "sequence1Text", [operations.join(", ")]),
  }
  return { question }
}

function generateOperationsVariantSequence(random: Random) {
  const amountOfOperations = random.int(6, 9)
  const s = new Stack<number>()
  const operations = []

  for (let i = 0; i < amountOfOperations; i++) {
    let operation = random.weightedChoice(["push", "pop"], [0.7, 0.3])
    if (s.isEmpty()) operation = "push"
    if (operation === "push") {
      const value = random.int(1, 30)
      s.push(value)
      operations.push("`Push(" + value + ")`")
    } else {
      s.getTop()
      operations.push("`Pop()`")
    }
  }
  return {
    operations,
    s,
  }
}
