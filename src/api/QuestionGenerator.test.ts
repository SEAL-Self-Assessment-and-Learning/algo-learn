import { expect, test } from "vitest"
import { fromPath, toPath } from "./QuestionGenerator"
import { TestQuestion } from "../question-generators/test/TestQuestion"

test("Test toPath()", () => {
  expect(toPath(TestQuestion, "de_DE", {})).toBe("de/asymptotics/sum")
  expect(toPath(TestQuestion, "en_US", { seed: "7" })).toBe(
    "en/asymptotics/sum/seed:7"
  )
})

test("Test fromPath()", () => {
  {
    const { lang, generatorPath, parameters } = fromPath("en/asymptotics/sum")
    expect(lang).toBe("en_US")
    expect(generatorPath).toBe("asymptotics/sum")
    expect(parameters).toBeDefined()
    expect(parameters.seed).toBeUndefined()
  }
  {
    const { lang, generatorPath, parameters } = fromPath(
      "de/asymptotics/sum/variant:dsl/seed:2882rk"
    )
    expect(lang).toBe("de_DE")
    expect(generatorPath).toBe("asymptotics/sum")
    expect(parameters).toBeDefined()
    expect(parameters.variant).toBe("dsl")
    expect(parameters.seed).toBe("2882rk")
  }
  {
    const { parameters } = fromPath("de/asymptotics/variant:dsl/skjsjksk")
    expect(parameters.skjsjksk).toBeUndefined()
  }
})
