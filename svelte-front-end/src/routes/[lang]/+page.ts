import { i18n } from "@/lib/translation"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({ params }) => {
  return i18n(params.lang)
}
