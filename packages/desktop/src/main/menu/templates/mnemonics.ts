type TopLevelMenuKey =
  | 'file'
  | 'edit'
  | 'paragraph'
  | 'format'
  | 'window'
  | 'theme'
  | 'language'
  | 'view'
  | 'help'

const WINDOWS_TOP_LEVEL_MNEMONICS: Record<TopLevelMenuKey, string> = {
  file: 'F',
  edit: 'E',
  paragraph: 'P',
  format: 'O',
  window: 'W',
  theme: 'T',
  language: 'L',
  view: 'V',
  help: 'H'
}

const EAST_ASIAN_LABEL_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u

export const withTopLevelMenuMnemonic = (key: TopLevelMenuKey, label: string): string => {
  if (process.platform !== 'win32' || !label) {
    return label
  }

  // Respect locale strings that already ship with an explicit mnemonic.
  if (label.includes('&')) {
    return label
  }

  const mnemonic = WINDOWS_TOP_LEVEL_MNEMONICS[key]
  if (EAST_ASIAN_LABEL_RE.test(label)) {
    return `${label}(${mnemonic})(&${mnemonic})`
  }

  const index = label.toUpperCase().indexOf(mnemonic)
  if (index >= 0) {
    return `${label.slice(0, index)}&${label[index]}${label.slice(index + 1)}(${mnemonic})`
  }

  return `${label}(${mnemonic})(&${mnemonic})`
}
