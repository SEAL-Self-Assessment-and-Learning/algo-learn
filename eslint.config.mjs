// @ts-check

import tseslint from "typescript-eslint"
import eslint from "@eslint/js"

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

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked, {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
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
})
