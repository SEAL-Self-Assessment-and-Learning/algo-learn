import { FunctionComponent, ReactNode } from "react"

/**
 * `Format` is a React component that formats a template string by replacing placeholders
 * with corresponding child elements.
 *
 * Each placeholder in the template string is a mustache variable like `{{0}}`, `{{1}}`, etc.
 * These placeholders are replaced by the corresponding child element.
 *
 * @param props - The properties passed to the component.
 * @param props.template - The template string containing placeholders.
 * @param props.children - The child elements to replace the placeholders.
 *
 * @returns The formatted string as a React element.
 *
 * @example
 * <Format template="Hello, {{0}}!">
 *   <strong>World</strong>
 * </Format>
 * // renders: Hello, <strong>World</strong>!
 */
export const Format: FunctionComponent<{
  template: string
  parameters?: ReactNode[]
}> = ({ template, parameters }) => {
  if (!parameters) {
    return template
  }
  const parts = template.split(/{{\d+}}/)
  const matches = template.match(/{{\d+}}/g) || []

  const result = parts.reduce(
    (prev, curr, i) => {
      const childIndex = matches[i] ? parseInt(matches[i].replace(/[{}]/g, "")) : -1
      if (childIndex >= 0 && childIndex < parameters.length) {
        return (
          <>
            {prev}
            {curr}
            {parameters[childIndex]}
          </>
        )
      } else {
        return (
          <>
            {prev}
            {curr}
          </>
        )
      }
    },
    <></>,
  )

  return result
}

/**
 * This function is given a text that may contain optional mustache-style
 * parameters. The parameters are replaced with the given values.
 *
 * @param text The template string; could also be an array of strings
 * @param parameters The parameters to replace in the translation. Parameters
 *   can be either positional (such as {{0}}, {{1}}, etc. or named (such as
 *   {{name}}, {{age}}, etc.).
 * @returns The translated text
 */
export function format(text: string, parameters?: string[] | Record<string, string>): string
export function format(text: string[], parameters?: string[] | Record<string, string>): string[]
export function format(
  text: string | string[],
  parameters?: string[] | Record<string, string>,
): string | string[]
export function format(
  text: string | string[],
  parameters: string[] | Record<string, string> = [],
): string | string[] {
  if (Array.isArray(text)) {
    return text.map((t) => format(t, parameters))
  }
  if (!Array.isArray(parameters)) {
    for (const [key, value] of Object.entries(parameters)) {
      text = text.replaceAll(`{{${key}}}`, value)
    }
  } else {
    for (let i = 0; i < parameters.length; i++) {
      text = text.replaceAll(`{{${i}}}`, parameters[i])
    }
  }
  return text
}
