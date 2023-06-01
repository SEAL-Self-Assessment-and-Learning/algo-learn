import {
  Language,
  Parameters,
  QuestionGenerator,
} from "../api/QuestionGenerator"

/**
 * Objects of the following type describes the routes to all available question
 * generators.
 */
export type QuestionRouter = Record<string, QuestionGenerator>

/**
 * Function that is given a list of question generators and returns a question
 * router object.
 *
 * @param generators The list of question generators
 * @returns The question router object
 */
export function makeQuestionRouter(
  generators: QuestionGenerator[]
): QuestionRouter {
  const router: QuestionRouter = {}
  for (const generator of generators) {
    router[generator.path] = generator
  }
  return router
}

/**
 * Function that is given a path and a questionRouter object and returns the
 * corresponding question generator.
 *
 * @param path The path to the question
 * @param questionRouter The question router object
 * @returns The question generator object
 */
export function questionGeneratorFromPath(
  path: string,
  questionRouter: QuestionRouter
): QuestionGenerator {
  const { generatorPath } = deserializePath(path)
  return questionRouter[generatorPath]
}

/**
 * Function that is given a path and a questionRouter object and returns the
 * corresponding question.
 *
 * @param path The path to the question
 * @param questionRouter The question router object
 * @returns The question generated from the given path
 */
export function questionFromPath(path: string, questionRouter: QuestionRouter) {
  const { lang, generatorPath, parameters } = deserializePath(path)
  const questionGenerator = questionGeneratorFromPath(path, questionRouter)
  if (!questionGenerator) {
    throw new Error(`Unknown question generator: ${generatorPath}`)
  }
  if (!questionGenerator.languages.includes(lang)) {
    throw new Error(
      `Question generator ${generatorPath} does not support language ${lang}`
    )
  }
  return questionGenerator.generate(parameters, lang)
}

/**
 * Function that is given a question generator and a list of parameters and
 * encodes this information in the URL path for the question.
 *
 * @param params
 * @param params.generatorPath The path to the question generator
 * @param params.lang The language to use when generating the question
 * @param params.parameters The parameters for a question
 * @returns The URL path describing the question generator with the given
 *   settings
 */
export function serializePath({
  generatorPath,
  lang,
  parameters,
}: {
  generatorPath: string
  lang: Language
  parameters: Parameters
}): string {
  let path = lang === "de_DE" ? "de" : lang === "en_US" ? "en" : lang
  path += "/" + generatorPath
  for (const [key, value] of Object.entries(parameters)) {
    path += value ? `/${key}:${value}` : ""
  }
  return path
}

/**
 * Same function, but gets the question generator object as input
 *
 * @param generator The question generator
 * @param lang The language to use when generating the question
 * @param parameters The parameters for a question
 * @returns The URL path describing the question generator with the given
 *   settings
 */
export function pathOf(
  generator: QuestionGenerator,
  lang: Language,
  parameters: Parameters
): string {
  return serializePath({
    generatorPath: generator.path,
    lang,
    parameters,
  })
}

/**
 * Deserializes a generator and parameters from a URL path.
 *
 * @param path The URL path
 * @returns The generator and parameters
 */
export function deserializePath(path: string): {
  lang: Language
  generatorPath: string
  parameters: Parameters
} {
  const parts = path.split("/")

  const lang: Language =
    parts[0] === "de"
      ? "de_DE"
      : parts[0] === "en"
      ? "en_US"
      : (parts[0] as Language)

  let generatorPath = ""
  let i = 1
  for (; i < parts.length && !parts[i].includes(":"); i++) {
    generatorPath += (generatorPath !== "" ? "/" : "") + parts[i]
  }

  const parameters: Parameters = {}
  for (; i < parts.length; i++) {
    if (parts[i].includes(":")) {
      const [name, value] = parts[i].split(":")
      parameters[name] = value
    }
  }

  return { lang, generatorPath, parameters }
}
