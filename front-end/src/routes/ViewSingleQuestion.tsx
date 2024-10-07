import { useNavigate } from "react-router-dom"
import { Parameters, validateParameters } from "@shared/api/Parameters"
import { QuestionGenerator, questionToJSON } from "@shared/api/QuestionGenerator"
import { serializeGeneratorCall } from "@shared/api/QuestionRouter"
import { questionToTex } from "@shared/utils/toLatex"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import Loading from "../components/Loading"
import { QuestionComponent, Result } from "../components/QuestionComponent"
import { useFormat } from "../hooks/useDebug"
import { useQuestion } from "../hooks/useQuestion"
import { useTranslation } from "../hooks/useTranslation"
import { Debug } from "./debug"

export function ViewSingleQuestion({
  generator,
  parameters,
  seed,
  onResult,
}: {
  generator: QuestionGenerator
  parameters: Parameters
  seed: string
  onResult?: (result: Result) => void
}) {
  const { lang } = useTranslation()
  const navigate = useNavigate()
  const { debug, format } = useFormat()

  const q = useQuestion(generator, lang, parameters, seed)

  if (!validateParameters(parameters, generator.expectedParameters)) {
    throw new Error("Invalid parameters: " + JSON.stringify(parameters))
  }
  return q.isLoading ? (
    <Loading />
  ) : format == "react" ? (
    <>
      <QuestionComponent
        key={serializeGeneratorCall({
          generator,
          parameters,
          seed,
        })}
        question={q.question}
        onResult={onResult ?? (() => navigate("/"))}
      />
      {debug && <Debug />}
    </>
  ) : (
    <>
      <HorizontallyCenteredDiv className="mt-10 w-full flex-grow overflow-y-scroll">
        <h1>{q.question.name}</h1>
        <div className={`container mx-auto p-4`}>
          <pre className="overflow-auto rounded-md bg-gray-800 p-4 text-white">
            <code>{(format == "latex" ? questionToTex : questionToJSON)(q.question)}</code>
          </pre>
        </div>
      </HorizontallyCenteredDiv>
      <Debug />
    </>
  )
}
