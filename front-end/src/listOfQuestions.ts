import { collection } from "@settings/questionsSelection"
import { allParameterCombinations } from "@shared/api/Parameters"
import { QuestionGenerator } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"

export { collection }

/** List of all skill groups. Will be the first part of the questions' routes. */
export const skillGroups: string[] = collection.map(({ slug }) => slug)

/** List of paths of all question variants in the collection. */
export const allQuestionVariantPaths: string[] = collection.flatMap((x) =>
  x.contents.flatMap((generator) =>
    allParameterCombinations(generator).map((parameters) =>
      serializeGeneratorCall({ generator, parameters }),
    ),
  ),
)

/**
 * Return all generators in the given group
 */
export function generatorsByGroup(slug: string): QuestionGenerator[] | undefined {
  return collection.find((x) => x.slug === slug)?.contents
}

/**
 * Return the generator with the given id
 */
export function generatorsById(id: string): QuestionGenerator | undefined {
  return collection.flatMap((x) => x.contents).find((x) => x.id === id)
}

/**
 * Return the collection slug containing the generator with the given id
 */
export function collectionContaining(id: string): string | undefined {
  return collection.find((x) => x.contents.some((y) => y.id === id))?.slug
}
