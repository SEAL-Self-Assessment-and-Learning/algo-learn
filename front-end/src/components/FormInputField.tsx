import { Input } from "@/components/ui/input"
import { useFormField } from "@/hooks/useFormContext"

/**
 * FormInputField is a text input field that is part of a form.
 *
 * @param key The key of the field in the form state.
 */
export function FormInputField(key: string) {
  const { text, setText, width, placeholder, invalid, feedback, disabled } = useFormField(key)
  console.log(`to-do: Also use ${invalid} and ${feedback} here.`)
  return (
    <Input
      type="text"
      value={text}
      onChange={setText && ((e) => setText(e.target.value))}
      width={width}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
