import { createContext, useContext } from "react"

/**
 * TextFieldState is the state of a single text input field.
 */
export type TextFieldState = {
  text: string // the current contents of the input field
  setText?: (text: string) => void // callback when the user changes the value
  width?: number // the requested width of the field in characters (usually em units)
  placeholder?: string // the placeholder text of the input (usually in gray)
  invalid?: boolean // true if the current value cannot be submitted (e.g. syntactically invalid)
  feedback?: string // immediate feedback on the value of this field
  disabled?: boolean // true if the input field should be disabled
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
