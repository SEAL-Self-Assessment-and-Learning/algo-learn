import { createContext, useContext } from "react"
import { MODE } from "@/components/InteractWithQuestion.tsx"

/**
 * TextFieldState is the state of a single text input field.
 */
export type TextFieldState = {
  text: string // the current contents of the input field
  align: string // the alignment of the text in the input field
  prompt: string // the prompt text of the input field
  feedbackVariation: string // the feedback variation of the input field
  setText?: (text: string) => void // callback when the user changes the value
  placeholder: string // the placeholder text of the input (usually in gray)
  modeID?: MODE // the mode of the input field
  questionMode?: MODE // the mode of the question
  feedback?: string // immediate feedback on the value of this field
  first?: boolean // true if this is the first input field in the form
}

/**
 * FormState is the state of a form consisting of one or more text input fields.
 */
export type FormState = Record<string, TextFieldState>

/**
 * FreeTextContext is the context to provide the current multiple choice form state.
 */
export const formContext = createContext<FormState | undefined>(undefined)

/**
 * useFormContext is a hook to access the settings of the requested input fields.
 */
export function useFormContext(): FormState {
  const context = useContext(formContext)
  if (context === undefined) {
    throw new Error("useFormContext must be used within <FormContext.Provider>")
  }
  return context
}

/**
 * useFormContext is a hook to access the settings of the requested input fields.
 */
export function useFormField(key: string): TextFieldState {
  const context = useFormContext()
  if (!(key in context)) {
    throw new Error(`key ${key} not found in the current form context`)
  }
  return context[key]
}
