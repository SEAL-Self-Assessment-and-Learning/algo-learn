import { expect, test } from "vitest"
import { serializePath, deserializePath } from "./QuestionRouter"

test("Test serializePath()", () => {
  expect(
    serializePath({
      generatorPath: "asymptotics/sum",
      lang: "de_DE",
      parameters: {},
    })
  ).toBe("de/asymptotics/sum")
  expect(
    serializePath({
      generatorPath: "asymptotics/sum",
      lang: "en_US",
      parameters: { seed: "7" },
    })
  ).toBe("en/asymptotics/sum/seed:7")
})

test("Test deserializePath()", () => {
  {
    const { lang, generatorPath, parameters } =
      deserializePath("en/asymptotics/sum")
    expect(lang).toBe("en_US")
    expect(generatorPath).toBe("asymptotics/sum")
    expect(parameters).toBeDefined()
    expect(parameters.seed).toBeUndefined()
  }
  {
    const { lang, generatorPath, parameters } = deserializePath(
      "de/asymptotics/sum/variant:dsl/seed:2882rk"
    )
    expect(lang).toBe("de_DE")
    expect(generatorPath).toBe("asymptotics/sum")
    expect(parameters).toBeDefined()
    expect(parameters.variant).toBe("dsl")
    expect(parameters.seed).toBe("2882rk")
  }
  {
    const { parameters } = deserializePath(
      "de/asymptotics/variant:dsl/skjsjksk"
    )
    expect(parameters.skjsjksk).toBeUndefined()
  }
})
