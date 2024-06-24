import { Language } from "./Language"

/** Utility type to enforce a non-empty string */
// export type NonEmptyString

/**
 * Each QuestionGenerator may support multiple variants and parameters with
 * which the difficulty and focus of the question can be adjusted. The
 * QuestionGenerator should provide a list of allowed parameters along with
 * their types, descriptions, and allowed values.
 */
export type ParameterBase = {
  /** Name of the parameter. */
  name: string

  /** Human-readable description of the parameter. */
  description?: (lang: Language) => string
}

/** BooleanParameter are parameters that can be set to a boolean value. */
export type BooleanParameter = ParameterBase & {
  type: "boolean"
}

/** IntegerParameters are parameters that can be set to an integer value. */
export type IntegerParameter = ParameterBase & {
  type: "integer"
  min: number
  max: number
}

/** StringParameters are parameters that can be set to a string value. */
export type StringParameter = ParameterBase & {
  type: "string"
  allowedValues: string[]
}

/** AllowedParameter is the union of all allowed parameter types. */

export type ExpectedParameters = ReadonlyArray<BooleanParameter | IntegerParameter | StringParameter>
/**
 * An object of type Parameters is what is given as input to the
 * QuestionGenerator to generate a question.
 */
export type Parameters = Record<string, boolean | number | string>

/**
 * Check whether the given parameters are valid.
 *
 * @param parameters The parameters to check
 * @param allowedParameters The allowed parameters
 * @returns Whether the parameters are allowed
 */
export function validateParameters(
  parameters: Parameters,
  allowedParameters: ExpectedParameters,
): boolean {
  let correct = true
  for (const allowedParameter of allowedParameters) {
    const value = parameters[allowedParameter.name]
    correct &&= value !== undefined
    if (allowedParameter.type === "integer") {
      correct &&=
        typeof value === "number" && value >= allowedParameter.min && value <= allowedParameter.max
    } else if (allowedParameter.type === "string") {
      correct &&=
        typeof value === "string" && value !== "" && allowedParameter.allowedValues.includes(value)
    }
  }
  return correct
}

/**
 * Returns the missing parameters.
 *
 * @example
 *   missingParameters({ difficulty: 1 }, [
 *     { name: "difficulty", type: "integer", min: 1, max: 3 },
 *     {
 *       name: "focus",
 *       type: "string",
 *       allowedValues: ["addition", "subtraction"],
 *     },
 *   ])
 *   // => [{ name: "focus", type: "string", allowedValues: ["addition", "subtraction"] }]
 *
 * @param parameters The parameters to check
 * @param allowedParameters The allowed parameters
 * @returns The missing parameters
 */
export function missingParameters(parameters: Parameters, allowedParameters: ExpectedParameters) {
  return allowedParameters.filter((p) => parameters[p.name] === undefined)
}

/**
 * Returns all possible combinations of parameters.
 *
 * @param expectedParameters The allowed parameters
 * @returns All possible combinations of parameters
 */
export function allParameterCombinations(expectedParameters: ExpectedParameters): Array<Parameters> {
  if (expectedParameters.length === 0) return [{}]

  const p = expectedParameters[0]
  const recCombinations: Array<Parameters> = allParameterCombinations(expectedParameters.slice(1))
  const newCombinations: Array<Parameters> = []
  for (const combinations of recCombinations) {
    if (p.type === "boolean") {
      newCombinations.push({ ...combinations, [p.name]: false })
      newCombinations.push({ ...combinations, [p.name]: true })
    } else if (p.type === "integer") {
      for (let v = p.min; v <= p.max; v++) {
        newCombinations.push({ ...combinations, [p.name]: v })
      }
    } else if (p.type === "string") {
      for (const v of p.allowedValues) {
        newCombinations.push({ ...combinations, [p.name]: v })
      }
    }
  }

  return newCombinations
}

/**
 * Serialize the given parameters as a URL path.
 *
 * @example
 *   serializeParameters({ difficulty: 1, focus: "addition" }, [
 *     { name: "difficulty", type: "integer", min: 1, max: 3 },
 *     {
 *       name: "focus",
 *       type: "string",
 *       allowedValues: ["addition", "subtraction"],
 *     },
 *   ])
 *   // => "/1/addition"
 *
 * @param parameters The parameters to check
 * @param expectedParameters The allowed parameters
 * @returns The URL path
 */
export function serializeParameters(
  parameters: Parameters,
  expectedParameters: ExpectedParameters,
): string {
  const parts = []
  for (const { name } of expectedParameters) {
    parts.push(parameters[name].toString())
  }
  return parts.join("/")
}

/**
 * Deserialize the given URL path as a Parameters object.
 *
 * @example
 *   deserializeParameters("/1/addition", [
 *     { name: "difficulty", type: "integer", min: 1, max: 3 },
 *     {
 *       name: "focus",
 *       type: "string",
 *       allowedValues: ["addition", "subtraction"],
 *     },
 *   ])
 *   // => { difficulty: 1, focus: "addition" }
 *
 * @param path The path to deserialize
 * @param expectedParameters The expected parameters
 * @returns The Parameters object
 */
export function deserializeParameters(path: string, expectedParameters: ExpectedParameters): Parameters {
  const parameterList = path.split("/")
  const parameters: Parameters = {}
  for (let i = 0; i < parameterList.length && i < expectedParameters.length; i++) {
    if (expectedParameters[i].type === "integer") {
      parameters[expectedParameters[i].name] = parseInt(parameterList[i], 10)
    } else if (expectedParameters[i].type === "string") {
      parameters[expectedParameters[i].name] = parameterList[i]
    }
  }
  return parameters
}
