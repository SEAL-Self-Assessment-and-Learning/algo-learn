import { useTranslation } from "react-i18next"
import { useLoaderData, useNavigate } from "react-router-dom"
import { QuestionType } from "../questions"

export function ViewSingleQuestion({
  Question,
  variant,
}: {
  Question: QuestionType
  variant: string
}) {
  const { t } = useTranslation()
  const { seed } = useLoaderData() as {
    seed: string
  }
  const navigate = useNavigate()

  if (!(Question.variants.find((v) => v === variant))) {
    throw new Error(`'${t(Question.title)}' does not have variant '${variant}'. Valid variants are: ${Question.variants.join(", ")}.`)
  }

  console.assert(seed !== null, "useSeed is null")
  return (
    <Question
      key={seed}
      seed={seed}
      variant={variant}
      t={t}
      onResult={() => navigate("/")}
      regeneratable={true}
    />
  )
}
