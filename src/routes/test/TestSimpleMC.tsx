import Random from "../../utils/random"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { QuestionComponent } from "./QuestionComponent"
import { HorizontallyCenteredDiv } from "../../components/CenteredDivs"
import SyntaxHighlighter from "react-syntax-highlighter"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { useTheme } from "../../hooks/useTheme"
import { TestQuestion } from "./TestQuestion"
import { MultipleChoiceAnswer, toJSON, toTex } from "./QuestionGenerator"

/** Component for testing the question generator */

export function TestSimpleMC() {
  const { i18n } = useTranslation()
  const { theme } = useTheme()
  const [seed] = useState(new Random(Math.random()).base36string(7))
  const [format, setFormat] = useState("react" as "react" | "latex" | "json")
  const lang = i18n.language === "de" ? "de_DE" : "en_US"
  const question = TestQuestion.generate({ seed, lang })
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
          feedback={(answer: MultipleChoiceAnswer) =>
            TestQuestion.feedback(question, answer)
          }
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
            {format === "latex" ? toTex(question) : toJSON(question)}
          </SyntaxHighlighter>
        </HorizontallyCenteredDiv>
      )}
    </>
  )
}
