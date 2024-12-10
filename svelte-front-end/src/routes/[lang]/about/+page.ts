import { loadI18n } from "@/lib/translation"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({ params, url }) => {
  return loadI18n(params.lang, url)
}
