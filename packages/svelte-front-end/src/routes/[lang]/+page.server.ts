import type { EntryGenerator } from "./$types"

export const entries: EntryGenerator = () => {
  return [{ lang: "en" }, { lang: "de" }]
}
