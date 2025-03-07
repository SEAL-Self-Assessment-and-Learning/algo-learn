import type { PageLoad } from "./$types"

export const load: PageLoad = ({ params }) => {
  return {
    generatorId: params.generatorId,
    params: params.params,
  }
}
