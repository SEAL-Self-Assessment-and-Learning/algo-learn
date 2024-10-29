import { Language } from "@shared/api/Language"
import { Parameters } from "@shared/api/Parameters"
import { Question, QuestionGenerator } from "@shared/api/QuestionGenerator"
import { useQuery } from "@tanstack/react-query"

/**
 * A hook to fetch a question from a question generator. This is useful in case the question generator returns a promise, e.g. because it needs to fetch data from a server.
 * @param generator The question generator to use
 * @param lang The language of the question
 * @param parameters The parameters for the question
 * @param seed The seed for the random number generator
 * @returns An object containing the current question and a boolean indicating
 *  whether the question is still loading
 */
export function useQuestion(
  generator: QuestionGenerator,
  lang: Language,
  parameters: Parameters,
  seed: string,
): { isLoading: true } | { isLoading: false; question: Question } {
  const queryKey = [generator, lang, parameters, seed]
  const query = useQuery({ queryKey, queryFn: async () => generator.generate(lang, parameters, seed) })

  if (query.data === undefined) {
    return { isLoading: true }
  } else {
    return { isLoading: false, question: query.data.question }
  }
}
