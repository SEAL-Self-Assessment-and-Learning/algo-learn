import { describe, expect, test } from "vitest"
import { allParameterCombinations } from "../../shared/src/api/Parameters"
import { allQuestionGeneratorRoutes } from "./listOfQuestions"

for (const { path, generator } of allQuestionGeneratorRoutes) {
  describe(`Sanity-checks for question generator "${path}"`, () => {
    test("Meta-data is present", () => {
      expect(path).not.toBe("")
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
          const ret = generator.generate(path, lang, parameters, "myFancySeed")
          expect(!(ret instanceof Promise)).toBe(true)
          if (ret instanceof Promise) return
          const { question } = ret
          expect(question.name).not.toBe("")
          expect(question.path).not.toBe("")
          expect(question.type).toMatch(
            /^(MultipleChoiceQuestion|FreeTextQuestion|MultiFreeTextQuestion)$/,
          )
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
            generator.generate(path, lang, { ...parameters, [p.name]: p.min - 1 }, "myFancySeed"),
          ).toThrow()
          expect(() =>
            generator.generate(path, lang, { ...parameters, [p.name]: p.max + 1 }, "myFancySeed"),
          ).toThrow()
        } else if (p.type === "string") {
          expect(() =>
            generator.generate(
              path,
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
