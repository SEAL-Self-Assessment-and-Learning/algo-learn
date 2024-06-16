import { describe, expect, test } from "vitest"
import { allParameterCombinations } from "@shared/api/Parameters"
import { collection } from "./listOfQuestions"

const generators = collection.flatMap((x) => x.contents)

describe(`IDs of question generators`, () => {
  const ids = new Set<string>()
  for (const generator of generators) {
    test(`id is non-empty`, () => {
      expect(generator.id.length).toBeTruthy()
      expect(generator.id.length).toBeGreaterThan(0)
    })
    test(`id ${generator.id} contains only lower case letters`, () => {
      expect(generator.id).toMatch(/^[a-z]+$/)
    })
    test(`id ${generator.id} has length at most 10`, () => {
      expect(generator.id.length).toBeLessThanOrEqual(10)
    })
    ids.add(generator.id)
  }
  test("All IDs are unique", () => {
    expect(ids.size).toBe(generators.length)
  })
  test("IDs do not contain forbidden words", () => {
    const forbiddenWords = ["en", "de"]
    for (const id of ids) {
      for (const word of forbiddenWords) {
        expect(id).not.toBe(word)
      }
    }
  })
})
for (const generator of generators) {
  describe(`Sanity-checks for question generator "${generator.id}"`, () => {
    test("Meta-data is present", () => {
      expect(generator.expectedParameters.length).toBeGreaterThanOrEqual(0)
      expect(generator.languages.length).toBeGreaterThan(0)
      for (const lang of generator.languages) {
        expect(generator.name(lang)).not.toBe("name")
      }
    })
    test("At least one valid value for each expected parameter", () => {
      for (const p of generator.expectedParameters) {
        if (p.type === "integer") {
          expect(p.min).toBeLessThanOrEqual(p.max)
        } else if (p.type === "string") {
          expect(p.allowedValues.length).toBeGreaterThan(0)
        }
      }
    })

    const allCombinations = allParameterCombinations(generator.expectedParameters)
    test(`Test that generator has at least one allowed input`, () => {
      expect(allCombinations.length).toBeGreaterThan(0)
    })
    for (const lang of generator.languages) {
      for (const parameters of allCombinations) {
        test(`Generate with language ${lang} and parameters ${JSON.stringify(parameters)}`, () => {
          const ret = generator.generate(lang, parameters, "myFancySeed")
          expect(!(ret instanceof Promise)).toBe(true)
          if (ret instanceof Promise) return
          const { question } = ret
          expect(question.name).not.toBe("")
          expect(question.path).not.toBe("")
          expect(question.type).toMatch(/^(MultipleChoiceQuestion|FreeTextQuestion)$/)
          expect(question.text).toBeDefined()
          expect(question.text).not.toBe("")
          expect(question.feedback).toBeDefined()
          if (question.type === "MultipleChoiceQuestion") {
            expect(() => question.feedback!({ choice: [0] })).not.toThrow()
          } else {
            const f = question.feedback!({ text: "some random wrong answer" })
            expect(!(f instanceof Promise)).toBe(true)
            if (f instanceof Promise) return
            expect(f.correct).toBe(false)
          }
        })
      }
    }

    const lang = generator.languages[0]
    const parameters = allCombinations[0]
    for (const p of generator.expectedParameters) {
      test(`Testing parameter ${JSON.stringify(p)}`, () => {
        if (p.type === "integer") {
          expect(() =>
            generator.generate(lang, { ...parameters, [p.name]: p.min - 1 }, "myFancySeed"),
          ).toThrow()
          expect(() =>
            generator.generate(lang, { ...parameters, [p.name]: p.max + 1 }, "myFancySeed"),
          ).toThrow()
        } else if (p.type === "string") {
          expect(() =>
            generator.generate(
              lang,
              { ...parameters, [p.name]: "non-existent-kjfewjokfwjiofw" },
              "myFancySeed",
            ),
          ).toThrow()
        }
      })
    }
  })
}
