const passSoundFile = new URL(
  "../../assets/sounds/573381__ammaro__ding.mp3",
  import.meta.url
)
const failSoundFile = new URL(
  "../../assets/sounds/566446__johnny97__break03.mp3",
  import.meta.url
)
const passSound = new Audio(passSoundFile.href)
const failSound = new Audio(failSoundFile.href)

export function playPassSound() {
  void passSound.play()
}

export function playFailSound() {
  void failSound.play()
}

// export function useAudio(url) {
//   const audio = useMemo(() => new Audio(url), [url])
//   const [playing, setPlaying] = useState(false)
//   const toggle = () => setPlaying(!playing)
//   useEffect(() => {
//     playing ? audio.play() : audio.pause()
//   }, [playing, audio])
//   useEffect(() => {
//     audio.addEventListener("ended", () => setPlaying(false))
//     return () => {
//       audio.removeEventListener("ended", () => setPlaying(false))
//     }
//   }, [audio])
//   return [playing, toggle]
// }
