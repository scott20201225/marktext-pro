// @vitest-environment happy-dom

import type Parent from '../block/base/parent';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Muya } from '../muya';

const hosts: HTMLElement[] = [];

beforeEach(() => {
    window.MUYA_VERSION = 'test';
});

afterEach(() => {
    while (hosts.length)
        hosts.pop()!.remove();
});

function boot(markdown: string): Muya {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const muya = new Muya(host, { markdown } as ConstructorParameters<typeof Muya>[1]);
    muya.init();
    hosts.push(muya.domNode);
    return muya;
}

function selectFirstTwoTaskItems(muya: Muya) {
    const taskList = muya.editor.scrollPage!.firstChild as Parent;
    const first = taskList.firstChild!.firstContentInDescendant()!;
    const second = (taskList.firstChild!.next as Parent).firstContentInDescendant()!;
    muya.editor.activeContentBlock = second;
    muya.editor.selection.setSelection(
        { offset: 0, block: first, path: first.path },
        { offset: second.text.length, block: second, path: second.path },
    );
}

describe('task status paragraph actions across multiple selected task items', () => {
    it('marks every selected task item as complete', async() => {
        const muya = boot('- [ ] alpha\n- [ ] bravo\n- [ ] charlie\n');
        selectFirstTwoTaskItems(muya);

        muya.updateParagraph('task-status-complete');

        await vi.waitFor(() => {
            const state = muya.getState();
            const children = (state[0] as { children: Array<{ meta?: { checked?: boolean } }> }).children;
            expect(children[0].meta?.checked).toBe(true);
            expect(children[1].meta?.checked).toBe(true);
            expect(children[2].meta?.checked).toBe(false);
        });
    });

    it('marks every selected task item as incomplete', async() => {
        const muya = boot('- [x] alpha\n- [x] bravo\n- [x] charlie\n');
        selectFirstTwoTaskItems(muya);

        muya.updateParagraph('task-status-incomplete');

        await vi.waitFor(() => {
            const state = muya.getState();
            const children = (state[0] as { children: Array<{ meta?: { checked?: boolean } }> }).children;
            expect(children[0].meta?.checked).toBe(false);
            expect(children[1].meta?.checked).toBe(false);
            expect(children[2].meta?.checked).toBe(true);
        });
    });
});
