import { collection as demos } from "./questionsSelection.demos"
import { oldPathToGenerator, collection as stable } from "./questionsSelection.stable"

/** The mode can be 'production', 'testing', and 'development' */
const mode: string = import.meta.env.MODE

export const DEFAULT_IMAGE = new URL("../../assets/images/skill-default.jpg", import.meta.url)
export { oldPathToGenerator }

export const collection = mode === "production" ? stable : demos.concat(stable)