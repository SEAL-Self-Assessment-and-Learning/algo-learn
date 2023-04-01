/** This file contains the configuration for the application. */

// The base URL of the application. Useful if project is deployed to a subdirectory.
export const basename =
  window.location.hostname === "tcs.uni-frankfurt.de" ? "/algo-learn" : ""

// The URL to the backend. This is used to prefix all URLs.
export const prefixURL = window.location.host + basename
