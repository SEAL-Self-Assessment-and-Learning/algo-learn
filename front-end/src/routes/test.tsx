import { useState } from "react"
import SyntaxHighlighter from "react-syntax-highlighter"
import { solarizedDark, solarizedLight } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Question, questionToJSON } from "../../../shared/src/api/QuestionGenerator"
import { ExampleQuestion } from "../../../shared/src/question-generators/example/example"
import Random from "../../../shared/src/utils/random"
import { questionToTex } from "../../../shared/src/utils/toLatex"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import { QuestionComponent } from "../components/QuestionComponent"
import { LIGHT, useTheme } from "../hooks/useTheme"
import { useTranslation } from "../hooks/useTranslation"

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { lang } = useTranslation()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState("react" as "react" | "latex" | "json")
  const [{ question }, setQuestion] = useState({} as { question: Question | undefined })

  if (!question) {
    void Promise.resolve(ExampleQuestion.generate("example/example", lang, {}, seed)).then(setQuestion)
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
  const { userTheme } = useTheme()
  if (format === "react") {
    return <QuestionComponent question={question} onResult={() => undefined} />
  }

  return (
    <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
      <SyntaxHighlighter
        language={format}
        style={userTheme === LIGHT ? solarizedLight : solarizedDark}
        wrapLongLines
      >
        {format === "latex" ? questionToTex(question) : questionToJSON(question)}
      </SyntaxHighlighter>
    </HorizontallyCenteredDiv>
  )
}
