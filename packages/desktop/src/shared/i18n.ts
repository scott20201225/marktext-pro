export const DEFAULT_LANGUAGE = 'zh-CN'

export const APP_LANGUAGE_OPTIONS = [
  { value: 'zh-CN', label: '🇨🇳 简体中文' },
  { value: 'zh-TW', label: '🇨🇳 繁體中文' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'it', label: '🇮🇹 Italiano' },
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'pt', label: '🇵🇹 Português' },
  { value: 'tr', label: '🇹🇷 Türkçe' }
] as const

export const SUPPORTED_LANGUAGES = APP_LANGUAGE_OPTIONS.map((option) => option.value) as string[]
