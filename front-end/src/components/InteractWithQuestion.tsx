import { ReactNode } from "react"
import { HorizontallyCenteredDiv } from "./CenteredDivs"
import { QuestionFooter } from "./QuestionFooter"
import { QuestionHeader } from "./QuestionHeader"

/** The current display mode */
export type MODE =
  | "initial" // Initial state, "Check" button is disabled
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
}: {
  permalink?: string
  name: string
  regenerate?: () => void
  children: ReactNode
  footerMode: MODE
  footerMessage: ReactNode
  handleFooterClick: () => void
}) {
  return (
    <>
      <HorizontallyCenteredDiv className="flex-grow">
        <QuestionHeader permalink={permalink} title={name} regenerate={regenerate} />
        <div>{children}</div>
      </HorizontallyCenteredDiv>
      <QuestionFooter mode={footerMode} message={footerMessage} buttonClick={handleFooterClick} />
    </>
  )
}
