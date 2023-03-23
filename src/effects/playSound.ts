const sounds = {
  pass: new URL(
    "../../assets/sounds/573381__ammaro__ding.mp3",
    import.meta.url
  ),
  fail: new URL(
    "../../assets/sounds/566446__johnny97__break03.mp3",
    import.meta.url
  ),
}

// Asynchronously prefetch audio files
const Audios = {} as Record<string, HTMLAudioElement>
for (const [name, url] of Object.entries(sounds)) {
  Audios[name] = new Audio(url.href)
}

/**
 * Play a sound effect.
 *
 * @param name The name of the sound effect to play.
 */
export default function playSound(name: string): void {
  void Audios[name].play()
}
