/**
 * This file contains a list of all questions available on the give instance of SEAL.
 * TODO: In future this file should be generated by a script.
 */
import type { QuestionCollection } from "@shared/api/QuestionRouter"
import { DemoMultiInput } from "@shared/question-generators/demos/multiInput"
import { DemoMultipleChoice } from "@shared/question-generators/demos/multipleChoice"
import { DemoSingleInput } from "@shared/question-generators/demos/singleInput"
import { DemoTables } from "@shared/question-generators/demos/tables.ts"

export const collection: QuestionCollection = [
  {
    slug: "demos",
    name: { de: "Demos", en: "Demos" },
    contents: [DemoMultipleChoice, DemoSingleInput, DemoMultiInput, DemoTables],
  },
]
