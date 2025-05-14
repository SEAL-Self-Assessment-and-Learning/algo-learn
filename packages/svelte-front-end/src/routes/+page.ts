import { base } from "$app/paths"
import { redirect } from "@sveltejs/kit"
import { DEFAULT_LANGUAGE } from "@/lib/translation"
import type { PageLoad } from "./$types"

export const load: PageLoad = () => {
  redirect(307, `${base}/${DEFAULT_LANGUAGE}`)
}
