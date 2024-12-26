import { SingleTranslation } from "@shared/utils/translations"
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
 * Checks whether the first path is a sub-path of the second path. The paths can
 * be given as path strings (e.g., "path/to/something") or as arrays of strings
 * (e.g., ["path", "to", "something"]).
 *
 * @param pathA The first path
 * @param pathB The second path
 * @returns Whether the first path is a sub-path of the second path
 */
// export function isSubPath(pathA: string, pathB: string): boolean
// export function isSubPath(partsA: string[], partsB: string[]): boolean
// export function isSubPath(a: string | string[], b: string | string[]): boolean {
//   if (typeof a === "string") a = a.split("/")
//   if (typeof b === "string") b = b.split("/")
//   a = a.filter((part) => part !== "")
//   b = b.filter((part) => part !== "")
//   if (a.length > b.length) return false
//   for (let i = 0; i < a.length; i++) {
//     if (a[i] !== b[i]) return false
//   }
//   return true
// }

/**
 * Deserializes a generator and parameters from a URL path.
 *
 * @example
 *   deserializePath(routes, "de/arithmetic/addition/2/myFancySeed")
 *   // => {
 *   //   lang: "de",
 *   //   generator: ArithmeticAdditionQuestionGenerator,
 *   //   parameters: { difficulty: 2 },
 *   //   seed: "myFancySeed",
 *   // }
 *
 * @param routes The routes to all available question generators
 * @param path The URL path
 * @param expectLang Whether the first segment in the path indicated the
 *   language (optional; if undefined, we will attempt to detect this
 *   automatically)
 * @returns The generator and parameters, or undefined if the route was not
 *   found
 */
export function deserializePath({
  collection,
  path,
  expectLang,
}: {
  collection: QuestionCollection
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

  return {
    lang,
    generator,
    parameters,
    seed,
  }
}
