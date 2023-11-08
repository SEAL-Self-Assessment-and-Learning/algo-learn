import { expect, test } from "vitest"

import { QuestionGenerator } from "./QuestionGenerator"
import {
  deserializePath,
  isSubPath,
  QuestionRoutes,
  serializeGeneratorCall,
} from "./QuestionRouter"

const ExampleQuestion: QuestionGenerator = {
  path: "test/test",
  name: () => "Example Question",
  languages: ["en", "de"],
  expectedParameters: [
    {
      name: "difficulty",
      type: "integer",
      min: 1,
      max: 3,
    },
    {
      name: "focus",
      type: "string",
      allowedValues: ["addition", "subtraction"],
    },
  ],
  generate: (lang, parameters, seed) => {
    return {
      question: {
        path: serializeGeneratorCall({
          generator: ExampleQuestion,
          parameters,
          seed,
          lang,
        }),
        type: "MultipleChoiceQuestion",
        name: "Example Question",
        text: "What is 1 + 1?",
        answers: ["1", "2", "3", "4"],
      },
    }
  },
}

const exampleRoutes: QuestionRoutes = [
  {
    path: "test/test",
    generator: ExampleQuestion,
  },
  {
    path: "asymptotics/sum",
    generator: ExampleQuestion,
  },
]

test("serializeGeneratorCall", () => {
  expect(
    serializeGeneratorCall({
      generator: ExampleQuestion,
    }),
  ).toBe("test/test")
  expect(
    serializeGeneratorCall({
      generator: ExampleQuestion,
      parameters: { difficulty: 1, focus: "addition" },
    }),
  ).toBe("test/test/1/addition")
  expect(
    serializeGeneratorCall({
      generator: ExampleQuestion,
      parameters: { difficulty: 1, focus: "addition" },
      seed: "myFancySeed",
    }),
  ).toBe("test/test/1/addition/myFancySeed")
  expect(
    serializeGeneratorCall({
      generator: ExampleQuestion,
      parameters: { difficulty: 1, focus: "addition" },
      seed: "myFancySeed",
      lang: "de",
    }),
  ).toBe("de/test/test/1/addition/myFancySeed")
})

test("deserializePath", () => {
  expect(
    deserializePath({ routes: exampleRoutes, path: "test/dqopijjifwejipfw" }),
  ).toBeUndefined()
  expect(
    deserializePath({ routes: exampleRoutes, path: "dkdkd/test/test" }),
  ).toBeUndefined()

  let ret = deserializePath({ routes: exampleRoutes, path: "test/test" })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBeUndefined()
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toBeUndefined()
  expect(ret!.seed).toBeUndefined()

  ret = deserializePath({ routes: exampleRoutes, path: "de/test/test" })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBe("de")
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toBeUndefined()
  expect(ret!.seed).toBeUndefined()

  ret = deserializePath({ routes: exampleRoutes, path: "test/test/1/addition" })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBeUndefined()
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })
  expect(ret!.seed).toBeUndefined()

  ret = deserializePath({
    routes: exampleRoutes,
    path: "test/test/1/addition/myFancySeed",
  })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBeUndefined()
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })
  expect(ret!.seed).toBe("myFancySeed")

  ret = deserializePath({
    routes: exampleRoutes,
    path: "de/test/test/1/addition/myFancySeed",
  })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBe("de")
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })

  ret = deserializePath({
    routes: exampleRoutes,
    path: "en/test/test/1/addition/myFancySeed",
  })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBe("en")
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })
})

test("isSubPath", () => {
  expect(isSubPath("a/b/c", "a/b/c")).toBe(true)
  expect(isSubPath("a/b/c", "a/b/c/d")).toBe(true)
  expect(isSubPath("a/////b/c", "a/b/c/d/e")).toBe(true)
  expect(isSubPath("/a/", "a")).toBe(true)
  expect(isSubPath("", "")).toBe(true)
  expect(isSubPath("", "a")).toBe(true)
  expect(isSubPath("", "a/b")).toBe(true)
  expect(isSubPath("a/b/c", "a/b")).toBe(false)
  expect(isSubPath("a/b/c", "b/c/d/e/f")).toBe(false)
  expect(isSubPath("a", "b")).toBe(false)
  expect(isSubPath("a", "")).toBe(false)

  expect(isSubPath([], [])).toBe(true)
  expect(isSubPath([], ["a"])).toBe(true)
  expect(isSubPath(["a"], ["a"])).toBe(true)
  expect(isSubPath(["a"], ["a", "b"])).toBe(true)
  expect(isSubPath(["b"], ["a", "b"])).toBe(false)
  expect(isSubPath(["b", "a"], ["a", "b"])).toBe(false)
})
