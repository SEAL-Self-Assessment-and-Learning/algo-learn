import { FunctionComponent } from "react"
import { Language } from "./Translations"

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

export interface QuestionParameters extends Record<string, string | number> {
  // could add required parameters here, such as
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
  generate: (parameters: QuestionParameters) => QuestionData // Generates an instance of the question from the given parameters
}

/**
 * QuestionData type for storing the generated data of the question. The
 * QuestionData type is used to store the generated question, and to produce the
 * LaTeX code for the question.
 */
export abstract class QuestionData {
  generatedFrom: string // The path to the question generator this question was generated from
  parameters: QuestionParameters // The parameters used when generating the question
  constructor(
    params:
      | {
          generatedFrom: string
          parameters: QuestionParameters
        }
      | string
  ) {
    if (typeof params === "string") {
      params = JSON.parse(params) as QuestionData
    }
    this.generatedFrom = params.generatedFrom
    this.parameters = params.parameters
  }
  abstract toJSON(lang: Language): string // Method to write the question data as JSON
  abstract toTex(lang: Language): string // Method to output the question in LaTeX for a specific language
  abstract Component: FunctionComponent<QuestionProps> // Method to produce an interactive ReactComponent from the Question instance, taking language as a prop
}

// Props for the Component in React
export interface QuestionProps {
  permalink?: string // Permalink to the question
  lang: Language // Which language to display the question in
  onResult?: (result: Result) => void // Callback for when a result is produced
  viewOnly?: boolean // Determines whether the component should displayed interactively or non-interactively
  regenerate?: () => void // Optional callback to regenerate the question
  source?: boolean // If true, display the LaTeX source code of the question
}

// Result type for exercise results
export type Result = "correct" | "incorrect" | "abort" | "timeout"
