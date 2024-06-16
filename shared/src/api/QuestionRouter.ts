import { SingleTranslation } from "@shared/utils/translations"
import {
  allQuestionVariantPaths,
  generatorsById,
  collection as globalCollection,
} from "@/listOfQuestions"
import { Language } from "./Language"
import {
  allParameterCombinations,
  deserializeParameters,
  missingParameters,
  Parameters,
} from "./Parameters"
import { QuestionGenerator } from "./QuestionGenerator"

/**
 * Objects of the following type describe a sequence of question collections.
 */
export type QuestionCollection = Array<{
  slug: string
  name: SingleTranslation
  contents: Array<QuestionGenerator>
  image?: URL
}>

/**
 * A generator call is a specific request to generate a question.
 */
export type GeneratorCall = {
  /* The language to use when generating the question (optional) */
  lang?: Language

  /* The question generator */
  generator: QuestionGenerator

  /* The parameters for a question (optional) */
  parameters?: Parameters

  /* The seed for a question (optional; can only be used if parameters are given) */
  seed?: string
}

/**
 * Serialize a generator call to a URL path.
 *
 * @param gc The generator call
 * @returns The URL path describing the question generator with the given
 *   settings. For example, "/de/asymptotics/sum/2/myFancySeed" if generator,
 *   parameters, seed, and lang are given, or "asymptotics/sum" if only the
 *   generator is given.
 */
export function serializeGeneratorCall({ lang, generator, parameters, seed }: GeneratorCall): string {
  const path: string[] = []
  if (lang !== undefined) path.push(lang)
  path.push(generator.id)
  if (parameters !== undefined) {
    for (const { name } of generator.expectedParameters) {
      if (parameters[name] === undefined) throw new Error(`Missing parameter: ${name}`)
      path.push(parameters[name].toString())
    }
  }
  if (seed !== undefined) path.push(seed)
  return path.join("/")
}

/**
 * Deserializes a generator and parameters from a URL path.
 *
 * @param collection A given QuestionCollection
 * @param path The URL path
 * @param expectLang Whether the first segment in the path indicated the
 *   language (optional; if undefined, we will attempt to detect this
 *   automatically)
 * @returns The generator and parameters, or undefined if the route was not
 *   found
 */
export function deserializePath({
  collection = globalCollection,
  path,
  expectLang,
}: {
  collection?: QuestionCollection
  path: string
  expectLang?: boolean
}): GeneratorCall | undefined {
  let parts = path.split("/")

  if (expectLang === undefined) {
    expectLang = parts[0] === "de" || parts[0] === "en"
  }

  const lang: Language | undefined = !expectLang ? undefined : parts[0] === "de" ? "de" : "en"

  if (lang !== undefined) {
    parts = parts.slice(1)
    path = parts.join("/")
  }

  const [generatorID, ...rest] = parts
  const generator = collection.flatMap((x) => x.contents).find((g) => g.id === generatorID)

  if (generator === undefined) return

  if (rest.length === 0) return { lang, generator }

  const restPath = rest.join("/")
  const parameters = deserializeParameters(restPath, generator.expectedParameters)
  const missing = missingParameters(parameters, generator.expectedParameters)
  const seed =
    missing.length === 0 && rest.length === generator.expectedParameters.length + 1
      ? rest.at(-1)
      : undefined

  return { lang, generator, parameters, seed }
}

/**
 * Generate a list of generator calls from a given path.
 *
 * @param generatorId The ID of the generator
 * @param parametersPath The path of the parameters
 * @returns A list of generator calls
 */
export function gcByPath({
  generatorId,
  parametersPath,
}: {
  generatorId?: string
  parametersPath?: string
}) {
  if (!generatorId)
    return allQuestionVariantPaths
      .map((path) => deserializePath({ path }))
      .filter((gc) => gc) as GeneratorCall[]

  const generator = generatorsById(generatorId)
  if (!generator) throw new Error(`Unknown generator ID: ${generatorId}`)

  const generatorCalls: Array<GeneratorCall> = []
  if (parametersPath) {
    const parameters = deserializeParameters(parametersPath, generator.expectedParameters)
    generatorCalls.push({ generator, parameters })
  } else {
    allParameterCombinations(generator).map((parameters) => {
      generatorCalls.push({ generator, parameters })
    })
  }
  return generatorCalls
}
