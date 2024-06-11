import { SingleTranslation } from "@shared/utils/translations"
import { collection as globalCollection } from "@/listOfQuestions"
import { Language } from "./Language"
import { deserializeParameters, missingParameters, Parameters } from "./Parameters"
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
 * Serialize a generator call to a URL path.
 *
 * @param lang The language to use when generating the question (optional)
 * @param generator The question generator
 * @param parameters The parameters for a question (optional)
 * @param seed The seed for a question (optional; can only be used if parameters
 *   are given)
 * @returns The URL path describing the question generator with the given
 *   settings. For example, "/de/asymptotics/sum/2/myFancySeed" if generator,
 *   parameters, seed, and lang are given, or "asymptotics/sum" if only the
 *   generator is given.
 */
export function serializeGeneratorCall({
  lang,
  generator,
  parameters,
  seed,
}: {
  lang?: Language
  generator: QuestionGenerator
  parameters?: Parameters
  seed?: string
}): string {
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
}):
  | {
      lang?: Language
      generator: QuestionGenerator
      parameters?: Parameters
      seed?: string
    }
  | undefined {
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
