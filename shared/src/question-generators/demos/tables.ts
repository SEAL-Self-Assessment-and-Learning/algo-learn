import type { MultiFreeTextQuestion, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { createArrayDisplayCodeBlock } from "@shared/utils/arrayDisplayCodeBlock.ts"
import { mdTableFromData } from "@shared/utils/markdownTools.ts"
import type { ColumnAlignment } from "@shared/utils/parseMarkdown.ts"
import { t, tFunctional, type Translations } from "@shared/utils/translations"

/**
 * All displayed text goes into the translations object.
 * Include at least english and german.
 */
const translations: Translations = {
  en: {
    name: "Tables",
    description: "Shows different table options",
    text: "Default:\n{{default}}\n\nFancy Header:\n{{header}}\n\nMore Lines:\n{{lines}}\n\nArray:\n{{array}}",
  },
}

/**
 * This question generator generates a simple multiple choice question.
 */
export const DemoTables: QuestionGenerator = {
  id: "demo-t",
  name: tFunctional(translations, "name"),
  description: tFunctional(translations, "description"),
  tags: ["demo"],
  languages: ["en"],
  license: "MIT",
  expectedParameters: [],

  /**
   * @param lang The language of the question
   * @param parameters The parameters for the question. In this case none are used.
   * @param seed The seed for the random number generator
   * @returns A new MultipleChoiceQuestion question
   */
  generate: (lang = "en", parameters, seed) => {
    const header = ["**A Col**", "*B Col*", "C Col", "D Col"]
    const data = [
      ["a1", "b1", "c1", "d1"],
      ["a2", "b2", "c2", "d2"],
      ["a3", "b3", "c3", "d3"],
      ["a4", "b4", "c4", "d4"],
      ["a5", "b5", "c5", "d5"],
    ]
    const alignment: ColumnAlignment[] = ["left", "center", "right", "center"]
    const tables = {
      default: mdTableFromData([header, ...data], alignment, undefined, [0]),
      header: mdTableFromData(data, alignment, header),
      lines: mdTableFromData(data, alignment, header, [0, 2], [0, 2]),
      array: createArrayDisplayCodeBlock({ array: data[0], lang }),
    }

    const question: MultiFreeTextQuestion = {
      type: "MultiFreeTextQuestion",
      name: DemoTables.name(lang),
      path: serializeGeneratorCall({
        generator: DemoTables,
        lang,
        parameters,
        seed,
      }),
      fillOutAll: true,
      text: t(translations, lang, "text", tables),
      feedback: () => {
        return { correct: false }
      },
    }

    return {
      question,
    }
  },
}
