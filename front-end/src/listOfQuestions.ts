import {
  allParameterCombinations,
  deserializeParameters,
  Parameters,
} from "../../shared/src/api/Parameters"
import { QuestionGenerator } from "../../shared/src/api/QuestionGenerator"
import { isSubPath, QuestionRoutes } from "../../shared/src/api/QuestionRouter"
import { Between } from "../../shared/src/question-generators/asymptotics/between"
import { LandauNotation } from "../../shared/src/question-generators/asymptotics/landau"
import { AsymptoticsPreciseLanguage } from "../../shared/src/question-generators/asymptotics/precise-language"
import { SortTerms } from "../../shared/src/question-generators/asymptotics/sort"
import { SimplifySum } from "../../shared/src/question-generators/asymptotics/sum"
import { RecursionFormula } from "../../shared/src/question-generators/recursion/formula"
import { RecurrenceMaster } from "../../shared/src/question-generators/recursion/recurrenceMaster"
import { Loops } from "../../shared/src/question-generators/time/loops"

/** List of all question routes */
export const allQuestionGeneratorRoutes: QuestionRoutes = [
  {
    path: "asymptotics/precise-language",
    generator: AsymptoticsPreciseLanguage,
  },
  {
    path: "asymptotics/sort",
    generator: SortTerms,
  },
  {
    path: "asymptotics/landau",
    generator: LandauNotation,
  },
  {
    path: "asymptotics/sum",
    generator: SimplifySum,
  },
  {
    path: "asymptotics/between",
    generator: Between,
  },
  {
    path: "recursion/formula",
    generator: RecursionFormula,
  },
  {
    path: "recursion/master",
    generator: RecurrenceMaster,
  },
  {
    path: "time/loops",
    generator: Loops,
  },
  // {
  //   path: "test/test",
  //   generator: TestQuestion,
  // },
]

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
