// @vitest-environment happy-dom

import type Content from '../../block/base/content';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Muya } from '../../muya';

const bootedHosts: HTMLElement[] = [];

beforeEach(() => {
    window.MUYA_VERSION = 'test';
});

afterEach(() => {
    while (bootedHosts.length)
        bootedHosts.pop()!.remove();
    delete (window as Partial<Window>).MUYA_VERSION;
});

function bootMuya(markdown: string): Muya {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const muya = new Muya(host, { markdown } as ConstructorParameters<typeof Muya>[1]);
    muya.init();
    bootedHosts.push(muya.domNode);
    return muya;
}

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

describe('editor event dispatch — cached selection fallback', () => {
    it('routes keydown to the cached content block when live DOM selection is temporarily null', () => {
        const muya = bootMuya('alpha\n');
        const alpha = contentByText(muya, 'alpha');

        alpha.setCursor(0, 0, true);

        const keydownSpy = vi.spyOn(alpha, 'keydownHandler');
        const realGetSelection = muya.editor.selection.getSelection.bind(muya.editor.selection);
        vi.spyOn(muya.editor.selection, 'getSelection')
            .mockImplementationOnce(() => null)
            .mockImplementation(realGetSelection);

        muya.domNode.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Backspace',
            bubbles: true,
            cancelable: true,
        }));

        expect(keydownSpy).toHaveBeenCalledTimes(1);
        expect(muya.editor.activeContentBlock).toBe(alpha);
    });
});
