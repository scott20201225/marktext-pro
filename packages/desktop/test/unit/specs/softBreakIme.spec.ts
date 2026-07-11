import { describe, expect, it } from 'vitest'
import { patchMuyaSoftBreakIme } from '@/util/softBreakIme'

interface FakeCursor {
  start: { offset: number }
  end: { offset: number }
}

class FakeContentBlock {
  text: string
  private cursor: FakeCursor

  constructor(text: string, offset: number) {
    this.text = text
    this.cursor = {
      start: { offset },
      end: { offset }
    }
  }

  getCursor(): FakeCursor {
    return this.cursor
  }

  setCursor(anchorOffset: number, focusOffset: number): void {
    this.cursor = {
      start: { offset: anchorOffset },
      end: { offset: focusOffset }
    }
  }

  composeHandler(): void {}

  inputHandler(): void {}

  shiftEnterHandler(): void {}
}

function patchBlock(block: FakeContentBlock): void {
  patchMuyaSoftBreakIme({
    getMarkdown: () => block.text,
    editor: {
      scrollPage: {
        firstContentInDescendant: () => block
      }
    }
  })
}

describe('patchMuyaSoftBreakIme', () => {
  it('seeds composition before an internal soft break and strips it on commit', () => {
    const block = new FakeContentBlock('warn\nbody', 4)
    patchBlock(block)

    block.composeHandler(new Event('compositionstart'))
    expect(block.text).toBe(`warn\u200B\nbody`)
    expect(block.getCursor().start.offset).toBe(5)

    block.text = `warn\u200B测\nbody`
    block.setCursor(6, 6)
    block.composeHandler(new Event('compositionend'))

    expect(block.text).toBe('warn测\nbody')
    expect(block.getCursor().start.offset).toBe(5)
  })

  it('reuses the trailing shift-enter placeholder without duplicating the seed', () => {
    const block = new FakeContentBlock(`warn\n\u200B`, 6)
    patchBlock(block)

    block.composeHandler(new Event('compositionstart'))
    expect(block.text).toBe(`warn\n\u200B`)

    block.text = `warn\n\u200B测`
    block.setCursor(7, 7)
    block.composeHandler(new Event('compositionend'))

    expect(block.text).toBe('warn\n测')
    expect(block.getCursor().start.offset).toBe(6)
  })
})
