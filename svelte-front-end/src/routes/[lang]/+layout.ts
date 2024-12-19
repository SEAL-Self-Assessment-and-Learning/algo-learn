import { loadI18n } from "@/lib/translation"
import type { LayoutLoad } from "./$types"

export const load: LayoutLoad = ({ params, url }) => loadI18n(params.lang, url)
