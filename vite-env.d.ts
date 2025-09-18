/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  // add other env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
