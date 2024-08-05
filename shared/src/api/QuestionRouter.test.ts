import { expect, test } from "vitest"
import { ExampleQuestion } from "@shared/question-generators/example/example"
import { QuestionGenerator } from "./QuestionGenerator"
import { deserializePath, QuestionCollection, serializeGeneratorCall } from "./QuestionRouter"

const testQuestion: QuestionGenerator = {
  id: "test",
  name: () => "Test Question",
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
          generator: testQuestion,
          parameters,
          seed,
          lang,
        }),
        type: "MultipleChoiceQuestion",
        name: "Test Question",
        text: "What is 1 + 1?",
        answers: ["1", "2", "3", "4"],
      },
    }
  },
}

test("serializeGeneratorCall", () => {
  expect(
    serializeGeneratorCall({
      generator: testQuestion,
    }),
  ).toBe(testQuestion.id)
  expect(
    serializeGeneratorCall({
      generator: testQuestion,
      parameters: { difficulty: 1, focus: "addition" },
    }),
  ).toBe(testQuestion.id + "/1/addition")
  expect(
    serializeGeneratorCall({
      generator: testQuestion,
      parameters: { difficulty: 1, focus: "addition" },
      seed: "myFancySeed",
    }),
  ).toBe(testQuestion.id + "/1/addition/myFancySeed")
  expect(
    serializeGeneratorCall({
      generator: testQuestion,
      parameters: { difficulty: 1, focus: "addition" },
      seed: "myFancySeed",
      lang: "de",
    }),
  ).toBe(`de/${testQuestion.id}/1/addition/myFancySeed`)
})

const exampleCollection: QuestionCollection = [
  {
    slug: "test",
    name: { en: "Test", de: "Test" },
    contents: [testQuestion],
  },
  {
    slug: "test2",
    name: { en: "Test2", de: "Test2" },
    contents: [ExampleQuestion],
  },
]

test("deserializePath", () => {
  expect(
    deserializePath({ collection: exampleCollection, path: "testdqopijjifwejipfw" }),
  ).toBeUndefined()
  expect(deserializePath({ collection: exampleCollection, path: "dkdkd/test/test" })).toBeUndefined()

  let ret = deserializePath({ collection: exampleCollection, path: "test" })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBeUndefined()
  expect(ret!.generator).toBe(testQuestion)
  expect(ret!.parameters).toBeUndefined()
  expect(ret!.seed).toBeUndefined()

  ret = deserializePath({ collection: exampleCollection, path: "de/example" })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBe("de")
  expect(ret!.generator).toBe(ExampleQuestion)
  expect(ret!.parameters).toBeUndefined()
  expect(ret!.seed).toBeUndefined()

  ret = deserializePath({ collection: exampleCollection, path: "test/1/addition" })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBeUndefined()
  expect(ret!.generator).toBe(testQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })
  expect(ret!.seed).toBeUndefined()

  ret = deserializePath({
    collection: exampleCollection,
    path: "test/1/addition/myFancySeed",
  })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBeUndefined()
  expect(ret!.generator).toBe(testQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })
  expect(ret!.seed).toBe("myFancySeed")

  ret = deserializePath({
    collection: exampleCollection,
    path: "de/test/1/addition/myFancySeed",
  })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBe("de")
  expect(ret!.generator).toBe(testQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })

  ret = deserializePath({
    collection: exampleCollection,
    path: "en/test/1/addition/myFancySeed",
  })
  expect(ret).toBeDefined()
  expect(ret!.lang).toBe("en")
  expect(ret!.generator).toBe(testQuestion)
  expect(ret!.parameters).toEqual({ difficulty: 1, focus: "addition" })
})
