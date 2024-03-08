import useLocalStorageState from "use-local-storage-state"

const sounds = {
  pass: new URL("../../assets/sounds/573381__ammaro__ding.mp3", import.meta.url),
  fail: new URL("../../assets/sounds/566446__johnny97__break03.mp3", import.meta.url),
}

// Asynchronously prefetch audio files
const audios = {} as Record<string, HTMLAudioElement>
for (const [name, url] of Object.entries(sounds)) {
  audios[name] = new Audio(url.href)
}

/**
 * A hook for playing sounds.
 *
 * @returns An object containing the current mute state, functions to set and
 *   toggle the mute state, and a function to play a sound.
 */
export function useSound() {
  const [muted, setMuted] = useLocalStorageState("muted", {
    defaultValue: false,
    storageSync: true,
  })
  const toggleMuted = () => {
    setMuted(!muted)
  }
  function playSound(name: string): void {
    if (muted) return
    void audios[name].play()
  }
  return { muted, setMuted, toggleMuted, playSound }
}
