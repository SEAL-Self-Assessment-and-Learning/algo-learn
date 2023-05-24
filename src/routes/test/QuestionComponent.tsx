import { FunctionComponent } from "react"
import { ExerciseMultipleChoice } from "./ExerciseMultipleChoice"
import { FeedbackFunction, Question } from "./QuestionGenerator"

/** Function to render the question as a React component */
export const QuestionComponent: FunctionComponent<QuestionComponentProps> = ({
  question,
  feedback,
  permalink,
  onResult,
  regenerate,
  viewOnly,
}) => {
  if (question.type === "MultipleChoiceQuestion" && !question.sorting) {
    return (
      <ExerciseMultipleChoice
        question={question}
        feedback={feedback}
        regenerate={regenerate}
        onResult={onResult}
        permalink={permalink}
        viewOnly={viewOnly}
      />
    )
  } else if (question.type === "MultipleChoiceQuestion" && question.sorting) {
    // return <ExerciseSorting...
  }
  return <></>
}

/** Props for the React Component */
export interface QuestionComponentProps {
  question: Question // The question object
  feedback?: FeedbackFunction // Function to generate feedback
  permalink?: string // Permalink to the question
  onResult?: (result: Result) => void // Callback for when a result is produced
  viewOnly?: boolean // Determines whether the component should displayed interactively or non-interactively
  regenerate?: () => void // Optional callback to regenerate the question
  source?: boolean // If true, display the LaTeX source code of the question
}

/** Result type for exercise results */
export type Result = "correct" | "incorrect" | "abort" | "timeout"
