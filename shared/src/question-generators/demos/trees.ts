import type { MultiFreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { RootedTree } from "@shared/utils/graph.ts"
import Random from "@shared/utils/random"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Trees",
    description: "Trees",
    text:
      "Some Trees:{{0}}{{1}}{{2}}{{3}}{{4}}{{5}}{{6}}{{7}}{{8}}{{9}}{{10}}{{11}}{{12}}{{13}}{{14}}{{15}}{{16}}{{17}}{{18}}{{19}}" +
      "{{20}}{{21}}{{22}}{{23}}{{24}}{{25}}{{26}}{{27}}{{28}}{{29}}{{30}}{{31}}{{32}}{{33}}{{34}}{{35}}{{36}}{{37}}{{38}}{{39}}" +
      "{{40}}{{41}}{{42}}{{43}}{{44}}{{45}}{{46}}{{47}}{{48}}{{49}}",
  },
}

/**
 * This question generator generates a simple multiple free text question.
 */
export const DemoTrees: QuestionGenerator = {
  id: "demogtrees",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en", "de"],
  license: "MIT",
  expectedParameters: [],

  /**
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns
   */
  generate(lang = "en", parameters, seed) {
    const random = new Random(seed)

    const trees: string[] = []
    for (let i = 0; i < 50; i++) {
      trees.push(
        RootedTree.random({ min: 2, max: 4 }, { min: 2, max: 4 }, random).toGraph().toMarkdown(),
      )
    }

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: DemoTrees.name(lang),
      path: serializeGeneratorCall({
        generator: DemoTrees,
        lang,
        parameters,
        seed,
      }),
      text: t(translations, lang, "text", trees),
      feedback: () => {
        return { correct: false }
      },
    }

    return {
      question,
    }
  },
}
