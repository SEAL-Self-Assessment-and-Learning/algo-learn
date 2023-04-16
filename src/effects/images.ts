const images = {
  time: new URL("../../assets/images/skill-time.jpg", import.meta.url),
  asymptotics: new URL(
    "../../assets/images/skill-asymptotics.jpg",
    import.meta.url
  ),
  recursion: new URL(
    "../../assets/images/skill-recursion.jpg",
    import.meta.url
  ),
}

export function getImageURL(name: string): string | undefined {
  if (name !== "time" && name !== "asymptotics" && name !== "recursion") {
    return undefined
  }
  return images[name].href
}
