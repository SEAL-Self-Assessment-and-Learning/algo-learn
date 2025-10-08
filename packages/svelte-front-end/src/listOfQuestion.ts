import { collection } from "@settings/questionsSelection"
import type { QuestionGenerator } from "@shared/api/QuestionGenerator"

export { collection }

/** List of all skill groups. Will be the first part of the questions' routes. */
export const skillGroups: string[] = collection.map(({ slug }) => slug)

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
