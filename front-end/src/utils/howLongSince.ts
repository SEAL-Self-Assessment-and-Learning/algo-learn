import { Language } from "../../../shared/src/api/Language"
import { Translations, tFunction } from "../../../shared/src/utils/translations"

const translations: Translations = {
  en_US: {
    future: "in the future",
    second: "one second ago",
    seconds: "{{0}} seconds ago",
    minute: "one minute ago",
    minutes: "{{0}} minutes ago",
    hour: "one hour ago",
    hours: "{{0}} hours ago",
    day: "yesterday",
    days: "{{0}} days ago",
    week: "last week",
    weeks: "{{0}} weeks ago",
    month: "last month",
    months: "{{0}} months ago",
    year: "last year",
    years: "{{0}} years ago",
  },
  de_DE: {
    future: "in der Zukunft",
    second: "vor einer Sekunde",
    seconds: "vor {{0}} Sekunden",
    minute: "vor einer Minute",
    minutes: "vor {{0}} Minuten",
    hour: "vor einer Stunde",
    hours: "vor {{0}} Stunden",
    day: "gestern",
    days: "vor {{0}} Tagen",
    week: "letzte Woche",
    weeks: "vor {{0}} Wochen",
    month: "letzten Monat",
    months: "vor {{0}} Monaten",
    year: "letztes Jahr",
    years: "vor {{0}} Jahren",
  },
}

export function printAgo(
  x: number,
  unit: "second" | "minute" | "hour" | "day" | "week" | "month" | "year",
  lang: Language = "en_US"
) {
  const { t } = tFunction(translations, lang)
  if (x === 1) {
    return t(unit, [`${x}`])
  } else {
    return t(unit + "s", [`${x}`])
  }
}

/**
 * Return a human-readable string of how long ago the given timestamp was
 *
 * @param timestamp Timestamp in milliseconds
 * @param lang Language to use (default: en_US)
 * @returns Human-readable string
 */
export function howLongSince(
  timestamp: number,
  lang: Language = "en_US"
): string {
  const { t } = tFunction(translations, lang)
  const now = Date.now()
  if (timestamp > now) {
    return t("future")
  }
  const duration = now - timestamp
  const seconds = Math.floor(duration / 1000)
  if (seconds < 60) {
    return printAgo(seconds, "second", lang)
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return printAgo(minutes, "minute", lang)
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return printAgo(hours, "hour", lang)
  }
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return printAgo(days, "day", lang)
  }
  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    return printAgo(weeks, "week", lang)
  }
  const months = Math.floor(weeks / 4)
  if (months < 12) {
    return printAgo(months, "month", lang)
  }
  const years = Math.floor(months / 12)
  return printAgo(years, "year", lang)
}
