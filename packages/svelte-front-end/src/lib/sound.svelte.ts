import { browser } from "$app/environment"
import { persisted } from "./persisted.svelte"

const muted = persisted<"true" | "false">("muted", "false")

const sounds = {
  pass: new URL("../../static/sounds/573381__ammaro__ding.mp3", import.meta.url),
  fail: new URL("../../static/sounds/incorrect/wrong.mp3", import.meta.url),
}

// Asynchronously prefetch audio files
const audios: Record<string, HTMLAudioElement> = {}

if (browser) {
  for (const [name, url] of Object.entries(sounds)) {
    audios[name] = new Audio(url.href)
  }
}

export function getMuted() {
  return muted.get() === "true"
}

export function setMuted(newMuted: boolean) {
  muted.set(newMuted ? "true" : "false")
}

export function toggleMuted() {
  setMuted(!getMuted())
}

export function playSound(name: string): void {
  if (!getMuted() && name in audios) void audios[name].play()
}
