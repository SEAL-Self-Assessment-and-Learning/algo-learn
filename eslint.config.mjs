// @ts-check

import prettier from "eslint-config-prettier"
import globals from "globals"
import ts from "typescript-eslint"
import react from "@eslint-react/eslint-plugin"
import js from "@eslint/js"
import tanstackQuery from "@tanstack/eslint-plugin-query"

const namingConvention = [
  {
    selector: "default",
    format: ["camelCase", "UPPER_CASE"],
    leadingUnderscore: "allow",
    trailingUnderscore: "allow",
  },
  {
    selector: "import",
    format: null,
  },
  {
    selector: "variable",
    format: ["camelCase", "PascalCase", "UPPER_CASE"],
    leadingUnderscore: "allow",
    trailingUnderscore: "allow",
  },
  {
    selector: "function",
    format: ["camelCase", "PascalCase"],
  },
  {
    selector: "typeLike",
    format: ["PascalCase"],
  },
  {
    selector: "objectLiteralProperty",
    format: null,
  },
]

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  ...tanstackQuery.configs["flat/recommended"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: ts.parser,
        project: "./tsconfig.json",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/unbound-method": [
        "error",
        {
          ignoreStatic: true,
        },
      ],
    },
  },
  {
    files: ["front-end/src/**/*.{ts,tsx}"],
    ...react.configs["recommended-type-checked"],
  },
  {
    files: ["front-end/src/**/*.{ts,tsx}"],
    rules: {
      "@eslint-react/no-leaked-conditional-rendering": "error",
      "@eslint-react/no-array-index-key": "off",
      "@eslint-react/prefer-read-only-props": "off",
    },
  },
  prettier,
  {
    ignores: ["**/*.config.{js,cjs,mjs}", "node_modules", "front-end/dist", "svelte-front-end/"],
  },
)
