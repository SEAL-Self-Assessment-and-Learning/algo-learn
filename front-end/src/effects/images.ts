import { images } from "../../../settings/questionsSelection.ts"

/**
 * Get the URL of the image with the given name.
 *
 * @param name - The name of the image.
 * @returns The URL of the image, or `undefined` if the name is invalid.
 */
export function getImageURL(name: string): string | undefined {
  if (name in images) {
    return images[name as keyof typeof images].href
  }

  return new URL("../../assets/images/skill-default.jpg", import.meta.url).href
}
