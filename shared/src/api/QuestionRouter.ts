import { Language } from "./Language"
import {
  deserializeParameters,
  missingParameters,
  Parameters,
} from "./Parameters"
import { QuestionGenerator } from "./QuestionGenerator"

/**
 * Objects of the following type describes the routes to all available question
 * generators.
 */
export type QuestionRoutes = Array<{
  path: string
  generator: QuestionGenerator
}>

/**
 * Serialize a generator call to a URL path.
 *
 * @param generator The question generator
 * @param parameters The parameters for a question (optional)
 * @param seed The seed for a question (optional; can only be used if parameters
 *   are given)
 * @param lang The language to use when generating the question (optional)
 * @returns The URL path describing the question generator with the given
 *   settings. For example, "/de/asymptotics/sum/2/myFancySeed" if generator,
 *   parameters, seed, and lang are given, or "asymptotics/sum" if only the
 *   generator is given.
 */
export function serializeGeneratorCall({
  generator,
  parameters,
  seed,
  lang,
  generatorPath,
}: {
  generator: QuestionGenerator
  parameters?: Parameters
  seed?: string
  lang?: Language
  generatorPath: string
}): string {
  const path: string[] = []
  if (lang !== undefined) {
    const langURL = lang === "de" ? "de" : lang === "en" ? "en" : lang
    path.push(langURL)
  }

  path.push(generatorPath)
  if (parameters === undefined) return path.join("/")

  for (const { name } of generator.expectedParameters) {
    if (parameters[name] === undefined) return path.join("/")
    path.push(parameters[name].toString())
  }

  if (seed === undefined) return path.join("/")

  path.push(seed)
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
export function isSubPath(pathA: string, pathB: string): boolean
export function isSubPath(partsA: string[], partsB: string[]): boolean
export function isSubPath(a: string | string[], b: string | string[]): boolean {
  if (typeof a === "string") a = a.split("/")
  if (typeof b === "string") b = b.split("/")
  a = a.filter((part) => part !== "")
  b = b.filter((part) => part !== "")
  if (a.length > b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

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
  routes,
  path,
  expectLang,
}: {
  routes: QuestionRoutes
  path: string
  expectLang?: boolean
}):
  | {
      lang?: Language
      generator: QuestionGenerator
      generatorPath: string
      parameters?: Parameters
      seed?: string
    }
  | undefined {
  let parts = path.split("/")

  if (expectLang === undefined) {
    expectLang = parts[0] === "de" || parts[0] === "en"
  }

  const lang: Language | undefined = !expectLang
    ? undefined
    : parts[0] === "de"
      ? "de"
      : "en"

  if (lang !== undefined) {
    parts = parts.slice(1)
    path = parts.join("/")
  }

  for (const { path: generatorPath, generator } of routes) {
    if (!isSubPath(generatorPath, path)) continue

    parts = parts.slice(generatorPath.split("/").length)
    if (parts.length === 0) return { lang, generator, generatorPath }

    const parameters = deserializeParameters(
      parts.join("/"),
      generator.expectedParameters,
    )

    const missing = missingParameters(parameters, generator.expectedParameters)
    const seed =
      missing.length === 0 &&
      parts.length === generator.expectedParameters.length + 1
        ? parts.at(-1)
        : undefined
    return { lang, generator, generatorPath, parameters, seed }
  }
}
