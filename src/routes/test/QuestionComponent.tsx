import { FunctionComponent } from "react"
import { ExerciseMultipleChoice } from "../../components/ExerciseMultipleChoice"
import { Question } from "./QuestionGenerator"

/** Function to render the question as a React component */
export const QuestionComponent: FunctionComponent<QuestionComponentProps> = ({
  question,
  permalink,
  onResult,
  regenerate,
}) => {
  if (question.type === "MultipleChoiceQuestion" && !question.sorting) {
    return (
      <ExerciseMultipleChoice
        question={question}
        regenerate={regenerate}
        onResult={onResult}
        permalink={permalink}
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
  permalink?: string // Permalink to the question
  onResult?: (result: Result) => void // Callback for when a result is produced
  regenerate?: () => void // Optional callback to regenerate the question
  // viewOnly?: boolean // Determines whether the component should displayed interactively or non-interactively
  // source?: boolean // If true, display the LaTeX source code of the question
}

/** Result type for exercise results */
export type Result = "correct" | "incorrect" | "abort" | "timeout"
