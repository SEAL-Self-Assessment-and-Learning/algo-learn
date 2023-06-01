import Random from "../../../shared/src/utils/random"
import { useState } from "react"
import { QuestionComponent } from "../components/QuestionComponent"
import { HorizontallyCenteredDiv } from "../components/CenteredDivs"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { useTheme } from "../hooks/useTheme"
import { TestQuestion } from "../../../shared/src/question-generators/test/TestQuestion"
import { questionToTex } from "../../../shared/src/utils/toLatex"
import { useTranslation } from "../hooks/useTranslation"
import {
  Question,
  questionToJSON,
} from "../../../shared/src/api/QuestionGenerator"

/** Component for testing the question generator */
export function TestSimpleMC() {
  const { lang } = useTranslation()
  const { theme } = useTheme()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState("react" as "react" | "latex" | "json")
  const [{ question }, setQuestion] = useState(
    {} as { question: Question | undefined }
  )

  if (!question) {
    void Promise.resolve(TestQuestion.generate({ seed, lang })).then(
      setQuestion
    )
    return <></>
  }
  return (
    <>
      <HorizontallyCenteredDiv className="select-none">
        <input
          type="radio"
          checked={format === "react"}
          onChange={(e) => e.target.checked && setFormat("react")}
          id="react-checkbox"
          className="m-2"
        />
        <label htmlFor="react-checkbox">React</label>
        <input
          type="radio"
          checked={format === "latex"}
          onChange={(e) => e.target.checked && setFormat("latex")}
          id="latex-checkbox"
          className="m-2"
        />
        <label htmlFor="latex-checkbox">LaTeX</label>
        <input
          type="radio"
          checked={format === "json"}
          onChange={(e) => e.target.checked && setFormat("json")}
          id="json-checkbox"
          className="m-2"
        />
        <label htmlFor="json-checkbox">JSON</label>
      </HorizontallyCenteredDiv>
      {format === "react" ? (
        <QuestionComponent
          question={question}
          key={seed}
          onResult={() => undefined}
        />
      ) : (
        <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
          <SyntaxHighlighter
            language={format}
            wrapLongLines
            style={theme === "dark" ? solarizedDark : solarizedLight}
          >
            {format === "latex"
              ? questionToTex(question)
              : questionToJSON(question)}
          </SyntaxHighlighter>
        </HorizontallyCenteredDiv>
      )}
    </>
  )
}
