import { collection as demos } from "./questionsSelection.demos"
import { oldPathToGenerator, collection as stable } from "./questionsSelection.stable"

const IMAGES_DIR = "@react-front-end/../assets/images"
export const DEFAULT_IMAGE = new URL(`${IMAGES_DIR}/skill-default.jpg`, import.meta.url)

/** The mode can be 'production', 'testing', and 'development' */
const mode: string = import.meta.env.MODE
export { oldPathToGenerator }

export const collection = mode === "production" ? stable : demos.concat(stable)
