import { createContext, useContext } from "react"

/**
 * TextFieldState is the state of a single text input field.
 */
export type TextFieldState = {
  text: string // the current contents of the input field
  type: string // the type of the input field
  prompt: string // the prompt text of the input field
  feedbackVariation: string // the feedback variation of the input field
  setText?: (text: string) => void // callback when the user changes the value
  placeholder: string // the placeholder text of the input (usually in gray)
  invalid: boolean // the mode of the input field
  disabled?: boolean // the mode of the question
  feedback?: string // immediate feedback on the value of this field
  focus?: boolean // true if this is the first input field in the form
}

/**
 * FormState is the state of a form consisting of one or more text input fields.
 */
export type FormState = [{ [id: string]: TextFieldState }, (id: string) => void]

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
  if (!(key in context[0])) {
    throw new Error(`key ${key} not found in the current form context`)
  }
  return context[0][key]
}

export function addFormField(key: string) {
  useFormContext()[1](key)
}
