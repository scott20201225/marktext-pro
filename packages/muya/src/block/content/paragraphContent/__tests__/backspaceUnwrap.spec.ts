// @vitest-environment happy-dom

import type Content from '../../../base/content';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Muya } from '../../../../muya';

// DATA-LOSS GUARD — backspace-at-offset-0 block surgery.
//
// Pressing Backspace at the very start of a paragraph either MERGES it onto the
// previous block or UNWRAPS it out of its container (block-quote / list). The
// migration audit flagged these cross-block paths as untested even though a
// miscount here drops or duplicates user content. `ParagraphContent`'s four
// branches are driven directly here (the handler reads the caret offset and the
// active block, the way a real Backspace keystroke routes through it), with the
// resulting document state asserted after the json1 op flushes on the next
// frame.

const bootedHosts: HTMLElement[] = [];
let originalVersion: string | undefined;
let hadVersion = false;

beforeEach(() => {
    hadVersion = 'MUYA_VERSION' in window;
    originalVersion = window.MUYA_VERSION;
    window.MUYA_VERSION = 'test';
});

afterEach(() => {
    while (bootedHosts.length) {
        const host = bootedHosts.pop()!;
        host.remove();
    }
    document.getSelection()?.removeAllRanges();
    if (hadVersion)
        window.MUYA_VERSION = originalVersion as string;
    else
        delete (window as Partial<Window>).MUYA_VERSION;
});

function bootMuya(options: ConstructorParameters<typeof Muya>[1]): Muya {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const muya = new Muya(host, options);
    muya.init();
    bootedHosts.push(muya.domNode);
    return muya;
}

function bootMarkdown(markdown: string): Muya {
    return bootMuya({ markdown } as ConstructorParameters<typeof Muya>[1]);
}

// Find the leaf `.content` block whose rendered text matches `text`, the way a
// click resolves the active content block.
function contentByText(muya: Muya, text: string): Content {
    let target: Content | null = null;
    const visit = (block: {
        text?: string;
        constructor: { blockName?: string };
        children?: { forEach: (cb: (b: unknown) => void) => void };
    }) => {
        if (block.constructor.blockName?.endsWith('.content') && block.text === text)
            target = block as unknown as Content;
        block.children?.forEach(b => visit(b as typeof block));
    };
    visit(muya.editor.scrollPage as unknown as Parameters<typeof visit>[0]);
    if (!target)
        throw new Error(`content block with text "${text}" not found`);
    return target;
}

// Land the caret at offset 0 of the given content block (active block + cursor),
// then route a Backspace through its handler the way the keydown listener does.
function backspaceAtStart(muya: Muya, content: Content): void {
    muya.editor.activeContentBlock = content;
    content.setCursor(0, 0, true);
    const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        key: 'Backspace',
    } as unknown as KeyboardEvent;
    content.backspaceHandler(event);
}

function backspaceAtOffset(muya: Muya, content: Content, offset: number) {
    muya.editor.activeContentBlock = content;
    content.setCursor(offset, offset, true);
    const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        key: 'Backspace',
    } as unknown as KeyboardEvent & {
        preventDefault: ReturnType<typeof vi.fn>;
        stopPropagation: ReturnType<typeof vi.fn>;
    };
    content.backspaceHandler(event);
    return event;
}

function arrowAtOffset(muya: Muya, content: Content, offset: number, key: 'ArrowLeft' | 'ArrowRight') {
    muya.editor.activeContentBlock = content;
    content.setCursor(offset, offset, true);
    const event = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        key,
        shiftKey: false,
    } as unknown as KeyboardEvent & {
        preventDefault: ReturnType<typeof vi.fn>;
        stopPropagation: ReturnType<typeof vi.fn>;
    };
    content.arrowHandler(event);
    return event;
}

function flush(): Promise<void> {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

// `getState()` returns a discriminated `TState` union; only some variants carry
// `text`. The blocks asserted here are paragraphs, so narrow to read it.
function blockText(state: ReturnType<Muya['getState']>, index: number): string {
    return (state[index] as { text: string }).text;
}

describe('backspace at start-of-paragraph — merge with previous block', () => {
    it('merges `beta` onto the end of `alpha` into a single paragraph', async () => {
        const muya = bootMarkdown('alpha\n\nbeta\n');
        const beta = contentByText(muya, 'beta');

        backspaceAtStart(muya, beta);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(state[0].name).toBe('paragraph');
        expect(blockText(state, 0)).toBe('alphabeta');
    });

    it('lands the caret at the join point (end of the former first paragraph)', async () => {
        const muya = bootMarkdown('alpha\n\nbeta\n');
        const beta = contentByText(muya, 'beta');

        backspaceAtStart(muya, beta);

        // The merge flushes on the next animation frame; await it before reading
        // the merged tree, otherwise contentByText/getCursor observe the
        // pre-merge state.
        await flush();
        // After the merge the active block is `alpha`'s content; the caret sits
        // at offset 5 (the original `alpha` length), where the two joined.
        const merged = contentByText(muya, 'alphabeta');
        const cursor = merged.getCursor();
        expect(cursor).not.toBeNull();
        expect(cursor!.start.offset).toBe(5);
    });

    it('is a no-op for the first paragraph in the document (no previous block)', async () => {
        const muya = bootMarkdown('only\n');
        const only = contentByText(muya, 'only');

        backspaceAtStart(muya, only);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(blockText(state, 0)).toBe('only');
    });
});

describe('backspace at start-of-paragraph — unwrap block-quote / list', () => {
    it('unwraps an only-child quote paragraph out of the block-quote', async () => {
        const muya = bootMarkdown('> quoted\n');
        const quoted = contentByText(muya, 'quoted');

        backspaceAtStart(muya, quoted);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(state[0].name).toBe('paragraph');
        expect(blockText(state, 0)).toBe('quoted');
    });

    it('unwraps an only/first list item out of the list to a paragraph', async () => {
        const muya = bootMarkdown('- item one\n');
        const item = contentByText(muya, 'item one');

        backspaceAtStart(muya, item);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(state[0].name).toBe('paragraph');
        expect(blockText(state, 0)).toBe('item one');
    });

    it('keeps the remaining items when the FIRST of several list items is unwrapped', async () => {
        const muya = bootMarkdown('- one\n- two\n- three\n');
        const first = contentByText(muya, 'one');

        backspaceAtStart(muya, first);

        await flush();
        const md = muya.getMarkdown();
        // `one` lifts out to a leading paragraph; `two` and `three` stay in the
        // list — nothing is dropped.
        expect(md).toContain('one');
        expect(md).toContain('two');
        expect(md).toContain('three');
        const state = muya.getState();
        expect(state[0].name).toBe('paragraph');
        expect(blockText(state, 0)).toBe('one');
        expect(state[1].name).toBe('bullet-list');
    });

    it('merges a MIDDLE list item into the previous item, preserving all text', async () => {
        const muya = bootMarkdown('- one\n- two\n- three\n');
        const two = contentByText(muya, 'two');

        backspaceAtStart(muya, two);

        await flush();
        const md = muya.getMarkdown();
        // The whole document stays a single bullet list; `two` is absorbed into
        // the previous item rather than dropped.
        expect(md).toContain('one');
        expect(md).toContain('two');
        expect(md).toContain('three');
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(state[0].name).toBe('bullet-list');
    });
});

describe('backspace at start-of-paragraph — footnote', () => {
    it('unwraps a non-empty only-child footnote into a plain paragraph', async () => {
        const muya = bootMuya({
            json: [
                {
                    name: 'footnote',
                    meta: { identifier: '1' },
                    children: [{ name: 'paragraph', text: 'alpha' }],
                },
            ],
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const alpha = contentByText(muya, 'alpha');

        backspaceAtStart(muya, alpha);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(state[0].name).toBe('paragraph');
        expect(blockText(state, 0)).toBe('alpha');
    });

    it('unwraps all footnote children when backspacing at the first footnote paragraph', async () => {
        const muya = bootMuya({
            json: [
                {
                    name: 'footnote',
                    meta: { identifier: '1' },
                    children: [
                        { name: 'paragraph', text: 'alpha' },
                        { name: 'paragraph', text: 'beta' },
                    ],
                },
            ],
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const alpha = contentByText(muya, 'alpha');

        backspaceAtStart(muya, alpha);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(2);
        expect(state[0].name).toBe('paragraph');
        expect(blockText(state, 0)).toBe('alpha');
        expect(state[1].name).toBe('paragraph');
        expect(blockText(state, 1)).toBe('beta');
    });

    it('merges later footnote paragraphs with the previous paragraph instead of swallowing Backspace', async () => {
        const muya = bootMuya({
            json: [
                {
                    name: 'footnote',
                    meta: { identifier: '1' },
                    children: [
                        { name: 'paragraph', text: 'alpha' },
                        { name: 'paragraph', text: 'beta' },
                    ],
                },
            ],
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const beta = contentByText(muya, 'beta');

        backspaceAtStart(muya, beta);

        await flush();
        const state = muya.getState();
        expect(state.length).toBe(1);
        expect(state[0].name).toBe('footnote');
        const children = (state[0] as { children: Array<{ name: string; text?: string }> }).children;
        expect(children).toHaveLength(1);
        expect(children[0].name).toBe('paragraph');
        expect(children[0].text).toBe('alphabeta');
    });

    it('removes an empty second footnote paragraph created by Enter and returns to the first paragraph', async () => {
        const muya = bootMuya({
            json: [
                {
                    name: 'footnote',
                    meta: { identifier: '1' },
                    children: [{ name: 'paragraph', text: 'alpha' }],
                },
            ],
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const alpha = contentByText(muya, 'alpha');

        muya.editor.activeContentBlock = alpha;
        alpha.setCursor(alpha.text.length, alpha.text.length, true);
        alpha.enterHandler({
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
            shiftKey: false,
            key: 'Enter',
        } as unknown as KeyboardEvent);

        await flush();
        const emptyLine = contentByText(muya, '');

        backspaceAtStart(muya, emptyLine);

        await flush();
        const state = muya.getState();
        expect(state).toHaveLength(1);
        expect(state[0].name).toBe('footnote');
        const children = (state[0] as { children: Array<{ name: string; text?: string }> }).children;
        expect(children).toHaveLength(1);
        expect(children[0].name).toBe('paragraph');
        expect(children[0].text).toBe('alpha');

        const first = contentByText(muya, 'alpha');
        const cursor = first.getCursor();
        expect(cursor).not.toBeNull();
        expect(cursor!.start.offset).toBe(first.text.length);
    });
});

describe('backspace in reference/footnote definition markers', () => {
    it('jumps from after a reference definition marker into the link label', async () => {
        const muya = bootMarkdown('[link]: https://example.com\n');
        const content = contentByText(muya, '[link]: https://example.com');

        const event = backspaceAtOffset(muya, content, '[link]: '.length);

        await flush();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(content.text).toBe('[link]: https://example.com');
        const cursor = content.getCursor();
        expect(cursor?.start.offset).toBe('[link'.length);
    });

    it('deletes both reference marker halves when Backspace hits the opening marker', async () => {
        const muya = bootMarkdown('[link]: https://example.com\n');
        const content = contentByText(muya, '[link]: https://example.com');

        const event = backspaceAtOffset(muya, content, 1);

        await flush();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(content.text).toBe('link https://example.com');
        expect(muya.getMarkdown()).toBe('link https://example.com\n');
    });

    it('jumps from after a footnote definition marker into the footnote name', async () => {
        const muya = bootMuya({
            markdown: '[^note]: alpha\n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^note]: alpha');

        const event = backspaceAtOffset(muya, content, '[^note]: '.length);

        await flush();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(content.text).toBe('[^note]: alpha');
        const cursor = content.getCursor();
        expect(cursor?.start.offset).toBe('[^note'.length);
    });

    it('deletes both footnote marker halves when Backspace hits the opening marker', async () => {
        const muya = bootMuya({
            markdown: '[^note]: alpha\n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^note]: alpha');

        const event = backspaceAtOffset(muya, content, 2);

        await flush();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(content.text).toBe('note alpha');
        expect(muya.getMarkdown()).toBe('note alpha\n');
    });

    it('removes the closing half too when an empty footnote marker is deleted from the left side', async () => {
        const muya = bootMuya({
            markdown: '[^]: \n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^]:');

        const event = backspaceAtOffset(muya, content, 2);

        await flush();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(content.text).toBe('');
        expect(muya.getMarkdown()).toBe('\n');
    });
});

describe('arrow navigation in reference/footnote definition markers', () => {
    it('skips the reference definition opening marker as one unit', async () => {
        const muya = bootMarkdown('[link]: https://example.com\n');
        const content = contentByText(muya, '[link]: https://example.com');

        const right = arrowAtOffset(muya, content, 0, 'ArrowRight');
        await flush();
        expect(right.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(1);

        const left = arrowAtOffset(muya, content, 1, 'ArrowLeft');
        await flush();
        expect(left.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(0);
    });

    it('skips the reference definition closing marker as one unit', async () => {
        const muya = bootMarkdown('[link]: https://example.com\n');
        const content = contentByText(muya, '[link]: https://example.com');
        const labelEnd = '[link'.length;
        const contentStart = '[link]: '.length;

        const right = arrowAtOffset(muya, content, labelEnd, 'ArrowRight');
        await flush();
        expect(right.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(contentStart);

        const left = arrowAtOffset(muya, content, contentStart, 'ArrowLeft');
        await flush();
        expect(left.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(labelEnd);
    });

    it('normalizes accidental caret positions inside the reference closing marker', async () => {
        const muya = bootMarkdown('[link]: https://example.com\n');
        const content = contentByText(muya, '[link]: https://example.com');
        const labelEnd = '[link'.length;
        const contentStart = '[link]: '.length;

        arrowAtOffset(muya, content, labelEnd + 1, 'ArrowLeft');
        await flush();
        expect(content.getCursor()?.start.offset).toBe(labelEnd);

        arrowAtOffset(muya, content, labelEnd + 1, 'ArrowRight');
        await flush();
        expect(content.getCursor()?.start.offset).toBe(contentStart);
    });

    it('skips the footnote definition opening marker as one unit', async () => {
        const muya = bootMuya({
            markdown: '[^note]: alpha\n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^note]: alpha');
        const labelStart = '[^'.length;

        const right = arrowAtOffset(muya, content, 0, 'ArrowRight');
        await flush();
        expect(right.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(labelStart);

        const left = arrowAtOffset(muya, content, labelStart, 'ArrowLeft');
        await flush();
        expect(left.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(0);
    });

    it('normalizes accidental caret positions inside the footnote opening marker', async () => {
        const muya = bootMuya({
            markdown: '[^note]: alpha\n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^note]: alpha');
        const labelStart = '[^'.length;

        arrowAtOffset(muya, content, 1, 'ArrowLeft');
        await flush();
        expect(content.getCursor()?.start.offset).toBe(0);

        arrowAtOffset(muya, content, 1, 'ArrowRight');
        await flush();
        expect(content.getCursor()?.start.offset).toBe(labelStart);
    });

    it('skips the footnote definition closing marker as one unit', async () => {
        const muya = bootMuya({
            markdown: '[^note]: alpha\n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^note]: alpha');
        const labelEnd = '[^note'.length;
        const contentStart = '[^note]: '.length;

        const right = arrowAtOffset(muya, content, labelEnd, 'ArrowRight');
        await flush();
        expect(right.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(contentStart);

        const left = arrowAtOffset(muya, content, contentStart, 'ArrowLeft');
        await flush();
        expect(left.preventDefault).toHaveBeenCalled();
        expect(content.getCursor()?.start.offset).toBe(labelEnd);
    });

    it('normalizes accidental caret positions inside the footnote closing marker', async () => {
        const muya = bootMuya({
            markdown: '[^note]: alpha\n',
            footnote: true,
        } as ConstructorParameters<typeof Muya>[1]);
        const content = contentByText(muya, '[^note]: alpha');
        const labelEnd = '[^note'.length;
        const contentStart = '[^note]: '.length;

        arrowAtOffset(muya, content, labelEnd + 1, 'ArrowLeft');
        await flush();
        expect(content.getCursor()?.start.offset).toBe(labelEnd);

        arrowAtOffset(muya, content, labelEnd + 1, 'ArrowRight');
        await flush();
        expect(content.getCursor()?.start.offset).toBe(contentStart);
    });
});
