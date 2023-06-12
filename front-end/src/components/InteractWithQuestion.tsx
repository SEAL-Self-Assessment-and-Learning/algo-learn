import { ReactNode } from "react"
import { HorizontallyCenteredDiv } from "./CenteredDivs"
import { QuestionFooter } from "./QuestionFooter"
import { QuestionHeader } from "./QuestionHeader"
import SyntaxHighlighter from "react-syntax-highlighter"
import { renderToStaticMarkup } from "react-dom/server"
import {
  solarizedDark,
  solarizedLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { useTheme } from "../hooks/useTheme"

/** The current display mode */
export type MODE =
  | "invalid" // Invalid selection (e.g. nothing selected), "Check" button is disabled
  | "draft" // Valid selection (e.g. at least one answer), but not yet submitted
  | "submitted" // "Check" was clicked, feedback was requested
  | "correct" // According to the feedback, the answer was correct
  | "incorrect" // According to the feedback, the answer was incorrect

/**
 * (Deprecated) Display question with a header, a main section, and a footer.
 * The footer can be used to verify the answer, or to show the correct/incorrect
 * answer.
 *
 * @param props
 * @param props.permalink Permalink to the question.
 * @param props.name Title of the question.
 * @param props.regenerate Function to regenerate the question.
 * @param props.children Main section of the question.
 * @param props.footerMode Mode of the footer. Can be "verify", "correct",
 *   "incorrect", or "disabled".
 * @param props.footerMessage Message to display in the footer.
 * @param props.handleFooterClick Function to handle clicking the footer button.
 */
export function InteractWithQuestion({
  permalink,
  name,
  regenerate,
  children,
  footerMode,
  footerMessage,
  handleFooterClick,
  source = false,
}: {
  permalink?: string
  name: string
  regenerate?: () => void
  children: ReactNode
  footerMode: MODE
  footerMessage: ReactNode
  handleFooterClick: () => void
  source?: boolean
}) {
  const { theme } = useTheme()
  if (source) {
    return (
      <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
        <SyntaxHighlighter
          language="latex"
          wrapLongLines
          style={theme === "dark" ? solarizedDark : solarizedLight}
        >
          {`\\begin{exercise}[${name}]\n` +
            renderToStaticMarkup(<>{children}</>) +
            `\\end{exercise}`}
        </SyntaxHighlighter>
      </HorizontallyCenteredDiv>
    )
  } else {
    return (
      <>
        <HorizontallyCenteredDiv className="w-full flex-grow overflow-y-scroll">
          <QuestionHeader
            permalink={permalink}
            title={name}
            regenerate={regenerate}
          />
          <div>{children}</div>
        </HorizontallyCenteredDiv>
        <QuestionFooter
          mode={footerMode}
          message={footerMessage}
          buttonClick={handleFooterClick}
        />
      </>
    )
  }
}
