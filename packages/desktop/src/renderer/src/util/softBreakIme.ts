const SOFT_BREAK_IME_SEED = '\u200B'
const SOFT_BREAK_IME_COMPOSE_PATCHED = Symbol('mtSoftBreakImeComposePatched')
const SOFT_BREAK_IME_INPUT_PATCHED = Symbol('mtSoftBreakImeInputPatched')
const SOFT_BREAK_IME_SHIFT_ENTER_PATCHED = Symbol('mtSoftBreakImeShiftEnterPatched')
const SOFT_BREAK_IME_ACTIVE = Symbol('mtSoftBreakImeActive')

interface RichContentCursor {
  start: { offset: number }
  end: { offset: number }
}

interface RichContentBlock {
  text?: string
  domNode?: HTMLElement | null
  getCursor?: () => RichContentCursor | null
  setCursor?: (anchorOffset: number, focusOffset: number, needUpdate?: boolean) => void
  [SOFT_BREAK_IME_ACTIVE]?: boolean
}

type RichContentEventHandler = (this: RichContentBlock, event: Event) => void

interface RichMuyaLike {
  getMarkdown: () => string
  editor?: {
    scrollPage?: {
      firstContentInDescendant?: () => unknown
    }
  }
}

export const normalizeSoftBreakImeMarkdown = (markdown: string): string =>
  markdown.replace(/\u200B/g, '')

export const patchMuyaSoftBreakIme = (muya: RichMuyaLike | null | undefined): void => {
  if (!muya) {
    return
  }

  const firstBlock = muya.editor?.scrollPage?.firstContentInDescendant?.() as
    | RichContentBlock
    | null
    | undefined
  if (!firstBlock) {
    return
  }

  patchMethod(firstBlock, 'composeHandler', SOFT_BREAK_IME_COMPOSE_PATCHED, (original) => {
    return function patchedComposeHandler(this: RichContentBlock, event: Event): void {
      original.call(this, event)

      if (event.type === 'compositionstart') {
        const seedOffset = getSoftBreakImeSeedOffset(this)
        if (seedOffset == null) {
          return
        }

        this[SOFT_BREAK_IME_ACTIVE] = true
        ensureSoftBreakImeSeed(this, seedOffset)
        return
      }

      if (event.type !== 'compositionend') {
        return
      }

      if (this[SOFT_BREAK_IME_ACTIVE]) {
        this[SOFT_BREAK_IME_ACTIVE] = false
        cleanupSoftBreakImeText(this, true)
        return
      }

      cleanupSoftBreakImeText(this, false)
    }
  })

  patchMethod(firstBlock, 'inputHandler', SOFT_BREAK_IME_INPUT_PATCHED, (original) => {
    return function patchedInputHandler(this: RichContentBlock, event: Event): void {
      original.call(this, event)
      cleanupSoftBreakImeText(this, false)
    }
  })

  patchMethod(firstBlock, 'shiftEnterHandler', SOFT_BREAK_IME_SHIFT_ENTER_PATCHED, (original) => {
    return function patchedShiftEnterHandler(this: RichContentBlock, event: Event): void {
      const cursor = this.getCursor?.()
      const text = typeof this.text === 'string' ? this.text : ''
      const shouldCreateTrailingPlaceholder =
        !!cursor &&
        cursor.start.offset === cursor.end.offset &&
        cursor.end.offset === text.length

      if (!shouldCreateTrailingPlaceholder) {
        original.call(this, event)
        cleanupSoftBreakImeText(this, false)
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const { start, end } = cursor
      this.text = `${text.substring(0, start.offset)}\n${SOFT_BREAK_IME_SEED}${text.substring(end.offset)}`
      this.setCursor?.(start.offset + 2, end.offset + 2, true)
    }
  })

  const originalGetMarkdown = muya.getMarkdown.bind(muya)
  muya.getMarkdown = () => normalizeSoftBreakImeMarkdown(originalGetMarkdown())
}

function patchMethod(
  instance: object,
  methodName: string,
  sentinel: symbol,
  createPatchedMethod: (original: RichContentEventHandler) => RichContentEventHandler
): void {
  const prototype = findPrototypeWithOwnMethod(instance, methodName)
  if (!prototype || prototype[sentinel]) {
    return
  }

  const original = prototype[methodName]
  if (typeof original !== 'function') {
    return
  }

  Object.defineProperty(prototype, sentinel, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false
  })

  prototype[methodName] = createPatchedMethod(original as RichContentEventHandler)
}

function findPrototypeWithOwnMethod(
  instance: object,
  methodName: string
): Record<PropertyKey, unknown> | null {
  let prototype = Object.getPrototypeOf(instance) as Record<PropertyKey, unknown> | null

  while (prototype) {
    if (Object.prototype.hasOwnProperty.call(prototype, methodName)) {
      return prototype
    }
    prototype = Object.getPrototypeOf(prototype) as Record<PropertyKey, unknown> | null
  }

  return null
}

function getSoftBreakImeSeedOffset(block: RichContentBlock): number | null {
  if (typeof block.text !== 'string') {
    return null
  }

  const cursor = block.getCursor?.()
  if (!cursor || cursor.start.offset !== cursor.end.offset) {
    return null
  }

  const { text } = block
  const offset = cursor.end.offset
  const prevChar = offset > 0 ? text[offset - 1] : ''
  const nextChar = offset < text.length ? text[offset] : ''

  if (nextChar === SOFT_BREAK_IME_SEED) {
    return offset
  }

  if (prevChar === SOFT_BREAK_IME_SEED) {
    return offset - 1
  }

  if (prevChar === '\n' || nextChar === '\n') {
    return offset
  }

  return null
}

function ensureSoftBreakImeSeed(block: RichContentBlock, offset: number): void {
  const text = typeof block.text === 'string' ? block.text : ''
  if (text[offset] === SOFT_BREAK_IME_SEED) {
    return
  }

  block.text = `${text.slice(0, offset)}${SOFT_BREAK_IME_SEED}${text.slice(offset)}`
  block.setCursor?.(offset + 1, offset + 1, true)
}

function cleanupSoftBreakImeText(block: RichContentBlock, forceTrailingSeedCleanup: boolean): void {
  if (typeof block.text !== 'string' || !block.text.includes(SOFT_BREAK_IME_SEED)) {
    return
  }

  const cursor = block.getCursor?.() ?? null
  const anchorOffset = cursor?.start.offset ?? block.text.length
  const focusOffset = cursor?.end.offset ?? block.text.length
  const normalized = stripSoftBreakImeSeeds(
    block.text,
    anchorOffset,
    focusOffset,
    forceTrailingSeedCleanup
  )

  if (normalized.text === block.text) {
    return
  }

  block.text = normalized.text
  if (cursor) {
    block.setCursor?.(normalized.anchorOffset, normalized.focusOffset, true)
  }
}

function stripSoftBreakImeSeeds(
  text: string,
  anchorOffset: number,
  focusOffset: number,
  forceTrailingSeedCleanup: boolean
): {
  text: string
  anchorOffset: number
  focusOffset: number
} {
  const keepTrailingSeed = !forceTrailingSeedCleanup && text.endsWith(`\n${SOFT_BREAK_IME_SEED}`)
  const trailingSeedIndex = keepTrailingSeed ? text.length - SOFT_BREAK_IME_SEED.length : -1
  let removedBeforeAnchor = 0
  let removedBeforeFocus = 0
  let normalized = ''

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === SOFT_BREAK_IME_SEED && index !== trailingSeedIndex) {
      if (index < anchorOffset) {
        removedBeforeAnchor += 1
      }
      if (index < focusOffset) {
        removedBeforeFocus += 1
      }
      continue
    }

    normalized += char
  }

  return {
    text: normalized,
    anchorOffset: Math.max(0, anchorOffset - removedBeforeAnchor),
    focusOffset: Math.max(0, focusOffset - removedBeforeFocus)
  }
}
