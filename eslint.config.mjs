// @ts-check

import tseslint from "typescript-eslint"
import react from "@eslint-react/eslint-plugin"
import js from "@eslint/js"

const namingConvention = [
  {
    selector: "default",
    format: ["camelCase"],
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

export default [
  {
    ignores: ["**/*.config.{js,cjs,mjs}", "node_modules", "front-end/dist"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...react.configs["recommended-type-checked"],
  },
  {
    rules: {
      "@eslint-react/no-leaked-conditional-rendering": "error",
      "@eslint-react/no-array-index-key": "off",
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/unbound-method": [
        "error",
        {
          ignoreStatic: true,
        },
      ],
    },
  },
]
