import { renderToString } from "katex"

/**
 * Render a LaTeX expression to HTML.
 * @param tex The LaTeX expression.
 * @param displayMode Whether to render in display mode.
 * @returns The HTML.
 *
 * @example
 * ```svelte
 * <script>
 *   import { latex } from "$lib/latex"
 * </script>
 *
 * {@html latex("x^2 + y^2 = 1")}
 * ```
 */
export function latex(tex: string, displayMode = false): string {
  return renderToString(tex, { displayMode })
}
