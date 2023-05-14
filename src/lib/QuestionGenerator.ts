import { FunctionComponent } from "react"
import { Language } from "./Translations"

// QuestionGenerator type for generating questions. Each question generator must also instantiate the template TParameters; this way, we can check during compile-time that valid parameters are given.
export interface QuestionGenerator<TParameters> {
  path: string // Can be used as part of the URL (only lower-case letters, numbers and dashes)
  name: (lang: Language) => string // Readable name of the question
  description: (lang: Language) => string // Short description of the question
  tags?: string[] // Tags for the question
  languages: Language[] // List of supported languages (de_DE, en_US)
  author?: string // Author of the question
  version?: string // Version of the question
  license?: string // License of the question
  link?: string // Link to the source code of the question
  generate: (parameters: TParameters) => Question<TParameters> // Generates an instance of the question from the given parameters
}

// Instances of type Question are produced by the generate method of QuestionGenerator
export interface Question<TParameters> {
  generatedFrom: QuestionGenerator<TParameters> // The question generator this question was generated from
  parameters: TParameters // The parameters used when generating the question
  toTex: (lang: Language) => string // Method to output the non-interactive question in LaTeX for a specific language
  Component: FunctionComponent<QuestionProps> // Method to produce an interactive ReactComponent from the Question instance, taking language as a prop
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
