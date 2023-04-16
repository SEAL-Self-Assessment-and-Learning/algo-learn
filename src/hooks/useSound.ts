import useLocalStorageState from "use-local-storage-state"

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
    void Audios[name].play()
  }
  return { muted, setMuted, toggleMuted, playSound }
}
