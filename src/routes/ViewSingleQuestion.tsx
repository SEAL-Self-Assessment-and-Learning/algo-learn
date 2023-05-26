import { useTranslation } from "../hooks/useTranslation"
import { useNavigate, useParams } from "react-router-dom"
import { QuestionVariant, pathOfQuestionVariant } from "../hooks/useSkills"

export function ViewSingleQuestion({ qv }: { qv: QuestionVariant }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { seed } = useParams() as {
    seed: string
  }

  if (!qv.question.variants.find((v) => v === qv.variant)) {
    throw new Error(
      `'${t(qv.question.title)}' does not have variant '${
        qv.variant
      }'. Valid variants are: ${qv.question.variants.join(", ")}.`
    )
  }

  console.assert(seed !== null, "useSeed is null")
  return (
    <qv.question.Component
      key={seed}
      seed={seed}
      variant={qv.variant}
      t={t}
      onResult={() => navigate("/")}
      regenerate={() => navigate(pathOfQuestionVariant(qv))}
      viewOnly
    />
  )
}
