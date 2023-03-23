import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import de from "./locales/de.json"
import en from "./locales/en.json"

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: { translation: en }, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      de: { translation: de }, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    },
  })

export default i18n
