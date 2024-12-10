import { redirect } from "@sveltejs/kit"
import { DEFAULT_LANGUAGE } from "@/lib/translation"
import type { PageLoad } from "./$types"

export const prerender = true

export const load: PageLoad = () => {
  redirect(307, `/${DEFAULT_LANGUAGE}/`)
}
