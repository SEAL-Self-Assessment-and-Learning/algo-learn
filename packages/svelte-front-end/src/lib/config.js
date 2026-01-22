/** This file contains the configuration for the application. */

// The base URL of the application. Useful if project is deployed to a subdirectory.
// This can be set by `--base` in `bun run build --base /path/`
// prettier-ignore
export const BASENAME = import.meta.env.BASE_URL

// The version of the application.
// prettier-ignore
export const VERSION = "local build" // Note: This is set in the CI pipeline!
