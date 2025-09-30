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
