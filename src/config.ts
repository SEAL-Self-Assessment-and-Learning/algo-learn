/** This file contains the configuration for the application. */

// The base URL of the application. Useful if project is deployed to a subdirectory.
export const BASENAME = "" // Note: This is set in the CI pipeline!

// The version of the application.
export const VERSION = "local build" // Note: This is set in the CI pipeline!

// The URL to the backend. This is used to prefix all URLs.
export const prefixURL = window.location.host + BASENAME
