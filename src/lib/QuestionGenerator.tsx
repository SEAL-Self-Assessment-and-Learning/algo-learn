import { Language } from "./Translations"
import { FunctionComponent } from "react"
import { ExerciseMultipleChoice } from "../components/ExerciseMultipleChoice"

interface BaseParameterType {
  name: string
  description: (lang: Language) => string
}

interface IntegerParameterType extends BaseParameterType {
  type: "integer"
  min?: number
  max?: number
}

interface StringParameterType extends BaseParameterType {
  type: "string"
  allowedValues?: string[]
}

type AllowedParameters = IntegerParameterType | StringParameterType

export interface Parameters extends Record<string, string | number | Language> {
  lang: Language
  // could add additional required parameters here, such as
  // seed: string
}

/** QuestionGenerator type for generating questions. */
export interface QuestionGenerator {
  path: string // Can be used as part of the URL (only lower-case letters, numbers and dashes)
  name: (lang: Language) => string // Readable name of the question
  description: (lang: Language) => string // Short description of the question
  tags?: string[] // Tags for the question
  languages: Language[] // List of supported languages (de_DE, en_US)
  author?: string // Author of the question
  version?: string // Version of the question
  license?: string // License of the question
  link?: string // Link to the source code of the question
  allowedParameters: AllowedParameters[]
  generate: (parameters: Parameters, lang?: Language) => QuestionData // Generates an instance of the question from the given parameters
}

/** Objects of type QuestionData store the generated data of the question. */
export type QuestionData = MultipleChoiceQuestionData // | SortQuestionData | FreeTextQuestionData

/**
 * Base type for QuestionData objects; all QuestionData objects must have at
 * least these properties.
 */
export interface QuestionDataBase {
  path: string // The path to the question generator this question was generated from
  name: string // The title of the question
  parameters: Parameters // The parameters used when generating the question
}

/**
 * MultipleChoiceQuestionData type for storing the generated data of multiple
 * choice questions.
 */
export interface MultipleChoiceQuestionData extends QuestionDataBase {
  text: string // The text of the question
  answers: string[] // List of possible answers to the question
  correctAnswerIndex: number // The index of the correct answer
  allowMultipleAnswers: boolean // Whether multiple answers are allowed
}

/**
 * Question is an abstract class that is responsible for rendering a question in
 * React or as LaTeX.
 */
export abstract class Question {
  path: string // The path to the question generator this question was generated from
  name: string // The title of the question
  parameters: Parameters // The parameters used when generating the question
  constructor(props: QuestionDataBase | string) {
    if (typeof props === "string") {
      props = JSON.parse(props) as QuestionDataBase
    }
    this.path = props.path
    this.name = props.name
    this.parameters = props.parameters
  }
  abstract toTex: () => string // Method to output the question in LaTeX for a specific language
  abstract Component: FunctionComponent<QuestionProps> // Method to produce an interactive ReactComponent from the Question instance, taking language as a prop
}

/**
 * Feedback object for multiple choice questions
 *
 * @param correct Whether the selected answer(s) are exactly correct
 * @param correctAnswers The indices of all correct answers
 * @param feedbackText The feedback text
 */
export interface MultipleChoiceQuestionFeedback {
  correct: boolean
  correctAnswers: number[]
  feedbackText: string
}

/**
 * MultipleChoiceQuestion type for multiple choice questions. Each individual
 * multiple choice question must be a subclass of this class, so that the
 * feedback function is implemented.
 */
export class MultipleChoiceQuestion extends Question {
  text: string // The text of the question
  answers: string[] // List of possible answers to the question
  allowMultipleAnswers: boolean // Whether multiple answers are allowed
  constructor(props: MultipleChoiceQuestionData | string) {
    if (typeof props === "string") {
      props = JSON.parse(props) as MultipleChoiceQuestionData
    }
    super(props)
    this.text = props.text
    this.answers = props.answers
    this.allowMultipleAnswers = props.allowMultipleAnswers
  }

  /**
   * Function to check whether the selected answer(s) are correct. This function
   * must be implemented by child classes of this class.
   *
   * @param answer The indices of the selected answer(s)
   * @returns A feedback object
   */
  feedback?: (answer: number[]) => MultipleChoiceQuestionFeedback

  /** Function to render the question in LaTeX */
  toTex = () => {
    // TODO: Turn markdown into LaTeX
    return `\\begin{exercise}[${this.name}]
  ${this.text}
  \\begin{itemize}
${this.answers.map((answer) => `    \\item ${answer}`).join("\n")}
  \\end{itemize}
\\end{exercise}`
  }

  /** Function to render the question as a React component */
  Component: FunctionComponent<QuestionProps> = ({
    permalink,
    onResult,
    regenerate,
    viewOnly,
  }) => {
    // TODO: Render markdown as React
    // HACK: map answers array to format required by current implementation of ExerciseMultipleChoice; TODO: change implementation of ExerciseMultipleChoice to accept answers array directly, and use a feedback function
    const answers = this.answers.map((answer, index) => ({
      key: `${index}`,
      element: <>{answer}</>,
      correct: true,
    }))
    return (
      <ExerciseMultipleChoice
        title={this.name}
        answers={answers}
        regenerate={regenerate}
        allowMultiple={this.allowMultipleAnswers}
        onResult={onResult}
        permalink={permalink}
        viewOnly={viewOnly}
      >
        {this.text}
      </ExerciseMultipleChoice>
    )
  }
}

/** Props for the React Component */
export interface QuestionProps {
  permalink?: string // Permalink to the question
  onResult?: (result: Result) => void // Callback for when a result is produced
  viewOnly?: boolean // Determines whether the component should displayed interactively or non-interactively
  regenerate?: () => void // Optional callback to regenerate the question
  source?: boolean // If true, display the LaTeX source code of the question
}

/** Result type for exercise results */
export type Result = "correct" | "incorrect" | "abort" | "timeout"
