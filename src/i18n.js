import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import fr from "./locales/fr.json";

// Simple example translations – only Arabic and French
const resources = {
  ar: {
    translation: ar,
  },
  fr: {
    translation: fr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    supportedLngs: ["ar", "fr"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // detect language from localStorage, navigator, etc.
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

