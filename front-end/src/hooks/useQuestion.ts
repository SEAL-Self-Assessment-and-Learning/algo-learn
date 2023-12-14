import { useEffect, useMemo, useState } from "react"
import { Language } from "../../../shared/src/api/Language"
import { Parameters } from "../../../shared/src/api/Parameters"
import {
  Question,
  QuestionGenerator,
} from "../../../shared/src/api/QuestionGenerator"

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
  const questionPromise = useMemo(
    () => generator.generate(lang, parameters, seed),
    [generator, lang, parameters, seed],
  )
  const [question, setQuestion] = useState<Question | undefined>(
    questionPromise instanceof Promise ? undefined : questionPromise.question,
  )
  const isLoading = question == undefined
  useEffect(() => {
    if (questionPromise instanceof Promise) {
      void questionPromise.then((q) => setQuestion(q.question))
    } else if (question !== questionPromise.question) {
      setQuestion(questionPromise.question)
    }
  }, [question, questionPromise])
  if (isLoading) {
    return { isLoading: true }
  } else {
    return { isLoading: false, question }
  }
}
