import { collection as demos } from "./questionsSelection.demos.ts"
import { oldPathToGenerator, collection as stable } from "./questionsSelection.stable.ts"

/** The mode can be 'production', 'testing', and 'development' */
const mode: string = import.meta.env.MODE
export { oldPathToGenerator }

export const collection = mode === "production" ? stable : demos.concat(stable)
