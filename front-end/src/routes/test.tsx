import { useState } from "react"
import { Question, questionToJSON } from "@shared/api/QuestionGenerator"
import { DemoMultipleChoice } from "@shared/question-generators/demos/multipleChoice.ts"
import Random from "@shared/utils/random"
import { questionToTex } from "@shared/utils/toLatex"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { QuestionComponent } from "../components/QuestionComponent"
import { useTranslation } from "../hooks/useTranslation"

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { lang } = useTranslation()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState<"react" | "latex" | "json">("react")
  const [{ question }, setQuestion] = useState<{ question?: Question }>({})

  if (!question) {
    void Promise.resolve(DemoMultipleChoice.generate(lang, {}, seed)).then(setQuestion)
    return <></>
  }
  return (
    <>
      <HorizontallyCenteredDiv className="select-none">
        <form action="" className="text-center">
          <fieldset>
            <legend>Select a display format:</legend>
            <RadioGroup
              value={format}
              className="mx-auto mt-2 flex w-fit gap-6"
              onValueChange={(f) => setFormat(f as "react" | "latex" | "json")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="react" id="r1" />
                <Label htmlFor="r1">React</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="latex" id="r2" />
                <Label htmlFor="r2">LaTeX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="r3" />
                <Label htmlFor="r3">JSON</Label>
              </div>
            </RadioGroup>
          </fieldset>
        </form>
      </HorizontallyCenteredDiv>
      <RenderQuestionAsFormat key={seed} question={question} format={format} />
    </>
  )
}

function RenderQuestionAsFormat({
  format,
  question,
}: {
  format: "react" | "latex" | "json"
  question: Question
}) {
  if (format === "react") {
    return <QuestionComponent question={question} onResult={() => undefined} />
  }

  return (
    <HorizontallyCenteredDiv className="mt-10 w-full flex-grow overflow-y-scroll">
      <div className={`container mx-auto p-4`}>
        <pre className="overflow-auto rounded-md bg-gray-800 p-4 text-white">
          <code>{(format == "latex" ? questionToTex : questionToJSON)(question)}</code>
        </pre>
      </div>
    </HorizontallyCenteredDiv>
  )
}
