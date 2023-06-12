import { useTranslation } from "../hooks/useTranslation"
import { useNavigate } from "react-router-dom"
import { QuestionComponent } from "../components/QuestionComponent"
import {
  Parameters,
  validateParameters,
} from "../../../shared/src/api/Parameters"
import { QuestionGenerator } from "../../../shared/src/api/QuestionGenerator"

export function ViewSingleQuestion({
  generator,
  parameters,
  seed,
}: {
  generator: QuestionGenerator
  parameters: Parameters
  seed: string
}) {
  const { lang } = useTranslation()
  const navigate = useNavigate()

  // const {
  //   generator,
  //   parameters,
  //   seed: URLseed,
  // } = deserializePath(allQuestionGeneratorRoutes, path)

  // const seed: string = URLseed ?? sampleRandomSeed()

  // const missing = missingParameters(parameters, generator.expectedParameters)
  // for (const m of missing) {
  //   if (m.type === "string") parameters[m.name] = m.allowedValues[0]
  //   else parameters[m.name] = m.min
  // }

  if (!validateParameters(parameters, generator.expectedParameters))
    throw new Error("Invalid parameters: " + JSON.stringify(parameters))

  const question = Promise.resolve(
    generator.generate(lang, parameters, seed)
  ).then((q) => q.question)
  return (
    <QuestionComponent
      questionPromise={question}
      onResult={() => navigate("/")}
    />
  )
}
