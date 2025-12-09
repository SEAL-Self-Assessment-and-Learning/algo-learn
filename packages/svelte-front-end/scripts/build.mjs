#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const isWindows = process.platform === "win32"
const binRoots = [
  resolve(scriptDir, "../node_modules/.bin"),
  resolve(scriptDir, "../../node_modules/.bin"),
  resolve(scriptDir, "../../../node_modules/.bin"),
]

function findBinary(name) {
  const executable = isWindows ? `${name}.cmd` : name
  for (const root of binRoots) {
    const candidate = resolve(root, executable)
    if (existsSync(candidate)) return candidate
  }
  return null
}

const svelteKitBin = findBinary("svelte-kit")
if (!svelteKitBin) {
  console.error("Unable to locate the svelte-kit executable. Did you install dependencies?")
  process.exit(1)
}

const viteBin = findBinary("vite")
if (!viteBin) {
  console.error("Unable to locate the vite executable. Did you install dependencies?")
  process.exit(1)
}

const forwardedArgs = process.argv.slice(2)

function ensureFlag(flag, value) {
  if (value === undefined) return
  const hasFlag = forwardedArgs.some((arg, idx) => {
    if (arg === flag) return true
    if (arg.startsWith(`${flag}=`)) return true
    return idx > 0 && forwardedArgs[idx - 1] === flag
  })
  if (!hasFlag) {
    forwardedArgs.push(flag, value)
  }
}

ensureFlag("--mode", process.env.MODE ?? process.env.npm_config_mode)
ensureFlag("--base", process.env.BASE ?? process.env.npm_config_base)

const syncResult = spawnSync(svelteKitBin, ["sync"], { stdio: "inherit" })
if (syncResult.status !== 0) {
  process.exit(syncResult.status ?? 1)
}

const buildResult = spawnSync(viteBin, ["build", ...forwardedArgs], { stdio: "inherit" })
process.exit(buildResult.status ?? 1)
