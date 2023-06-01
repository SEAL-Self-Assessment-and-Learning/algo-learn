import { TestQuestion } from "../../shared/src/question-generators/test/TestQuestion"
import { makeQuestionRouter } from "../../shared/src/utils/QuestionRouter"

export const ALL_QUESTION_GENERATORS = makeQuestionRouter([TestQuestion])
