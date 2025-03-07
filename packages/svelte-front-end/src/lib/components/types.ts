// Todo: Remove this file and move types

export type Result = "correct" | "incorrect" | "abort" | "timeout"

/** The current display mode */
export type MODE =
  | "initial" // Initial state, "Check" button is disabled
  | "invalid" // Invalid selection (e.g. nothing selected), "Check" button is disabled
  | "draft" // Valid selection (e.g. at least one answer), but not yet submitted
  | "submitted" // "Check" was clicked, feedback was requested
  | "correct" // According to the feedback, the answer was correct
  | "incorrect" // According to the feedback, the answer was incorrect
