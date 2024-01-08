import {
  allParameterCombinations,
  deserializeParameters,
  Parameters,
} from "../../shared/src/api/Parameters"
import { QuestionGenerator } from "../../shared/src/api/QuestionGenerator"
import { isSubPath } from "../../shared/src/api/QuestionRouter"

import { allQuestionGeneratorRoutes } from "../../settings/questionsSelection"
export { allQuestionGeneratorRoutes }

/** List of all skill groups. Will be the first part of the questions' routes. */
export const skillGroups: string[] = []
for (const { path: route } of allQuestionGeneratorRoutes) {
  const [group] = route.split("/")
  if (!skillGroups.includes(group)) skillGroups.push(group)
}

/**
 * Return all generator/parameter combinations below the given path
 *
 * @param path Partial path to the question variant(s)
 * @param generatorRoutes List of all question generator routes to consider
 * @returns List of generator/parameter combinations below the given path
 */
export function generatorSetBelowPath(
  path: string,
  generatorRoutes = allQuestionGeneratorRoutes,
): Array<{ generator: QuestionGenerator; parameters: Parameters }> {
  const set = []
  for (const { path: generatorPath, generator } of generatorRoutes) {
    if (isSubPath(path, generatorPath)) {
      for (const parameters of allParameterCombinations(
        generator.expectedParameters,
      )) {
        set.push({ generator, parameters })
      }
    } else if (isSubPath(generatorPath, path)) {
      const parameters = deserializeParameters(
        path.slice(generatorPath.length + 1),
        generator.expectedParameters,
      )
      for (const paramExtensions of allParameterCombinations(
        generator.expectedParameters.filter((p) => !(p.name in parameters)),
      )) {
        set.push({
          generator,
          parameters: { ...parameters, ...paramExtensions },
        })
      }
    }
  }
  return set
}
