import fs from 'fs'
import path from 'path'
import { APP_LANGUAGE_OPTIONS, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@shared/i18n'

export type Translations = Record<string, unknown>

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

let translationsCache: Record<string, Translations> = {}

/**
 * Loads the translation file for the specified language. Falls back to English
 * on error; returns null if even the English fallback can't be loaded.
 */
function loadTranslations(language: string): Translations | null {
  if (translationsCache[language]) {
    return translationsCache[language]
  }

  try {
    // Used in both main and preload processes, so we can't lean on
    // `global.__static`, which is main-only.
    // Prefer repo-local locale files whenever the app is launched from a
    // source checkout (for example `electron.cmd .` against packages/desktop),
    // even if NODE_ENV is "production". Packaged apps still fall back to the
    // resources directory.
    const localeCandidates = [
      path.join(process.cwd(), 'static', 'locales', `${language}.json`),
      path.join(process.cwd(), 'static', 'locales', `${language}.min.json`),
      process.resourcesPath
        ? path.join(process.resourcesPath, 'static', 'locales', `${language}.min.json`)
        : null
    ].filter((candidate): candidate is string => !!candidate)

    const localePath = localeCandidates.find((candidate) => fs.existsSync(candidate))
    if (!localePath) {
      throw new Error(`Translation file not found for language: ${language}`)
    }

    const content = fs.readFileSync(localePath, 'utf8')

    const translationData: Translations = JSON.parse(content)

    translationsCache[language] = translationData
    return translationData
  } catch (error) {
    console.error('Error loading translation:', error)
    if (language !== 'en') {
      return loadTranslations('en')
    }
    return null
  }
}

/**
 * Gets the translated text. Supports dot-separated nested keys; substitutes
 * `{param}` tokens with values from the optional `params` map.
 */
function getTranslation(
  key: string,
  language: string = DEFAULT_LANGUAGE,
  params: Record<string, string | number> = {}
): string {
  const translations = loadTranslations(language)

  if (!translations) {
    return key
  }

  const keys = key.split('.')
  let probe: unknown = translations

  for (const segment of keys) {
    if (probe && typeof probe === 'object' && segment in (probe as Record<string, unknown>)) {
      probe = (probe as Record<string, unknown>)[segment]
    } else {
      return key
    }
  }

  if (typeof probe !== 'string') {
    return key
  }

  let result = probe
  for (const [param, replacement] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), String(replacement))
  }

  return result
}

function getSupportedLanguages(): string[] {
  return [...SUPPORTED_LANGUAGES]
}

function isLanguageSupported(language: string): boolean {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
}

function clearCache(): void {
  translationsCache = {}
}

function getAllTranslations(language: string): Translations | null {
  return loadTranslations(language)
}

export {
  APP_LANGUAGE_OPTIONS,
  DEFAULT_LANGUAGE,
  getTranslation,
  getSupportedLanguages,
  isLanguageSupported,
  clearCache,
  getAllTranslations,
  loadTranslations,
  SUPPORTED_LANGUAGES
}
