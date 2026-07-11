// @vitest-environment happy-dom
import type { IFootnoteBlockState } from '../../../../state/types';
import type Content from '../../../base/content';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Footnote from '..';
import { Muya } from '../../../../muya';
import { MarkdownToState } from '../../../../state/markdownToState';
import ExportMarkdown from '../../../../state/stateToMarkdown';
import { registerBlocks } from '../../../index';
import { ScrollPage } from '../../../scrollPage';

// Register the block tree once for the suite. registerBlocks() is idempotent:
// `ScrollPage.registeredBlocks` is a Map keyed by stable `blockName` strings,
// so subsequent imports of this file or its sibling specs reuse the same map.
registerBlocks();

const bootedHosts: HTMLElement[] = [];
let originalVersion: string | undefined;
let hadVersion = false;

beforeEach(() => {
    hadVersion = 'MUYA_VERSION' in window;
    originalVersion = window.MUYA_VERSION;
    window.MUYA_VERSION = 'test';
});

afterEach(() => {
    while (bootedHosts.length)
        bootedHosts.pop()!.remove();
    document.getSelection()?.removeAllRanges();
    if (hadVersion)
        window.MUYA_VERSION = originalVersion as string;
    else
        delete (window as Partial<Window>).MUYA_VERSION;
});

function bootMuya(markdown: string, options: Partial<ConstructorParameters<typeof Muya>[1]> = {}): Muya {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const muya = new Muya(host, { markdown, ...options } as ConstructorParameters<typeof Muya>[1]);
    muya.init();
    bootedHosts.push(muya.domNode);
    return muya;
}

function flush(): Promise<void> {
    return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
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

// Footnote.create() walks down through `ScrollPage.loadBlock(child.name)`
// into ParagraphContent, whose constructor calls `update()` and reads
// `muya.editor.inlineRenderer.patch / getLabelInfo` plus `muya.i18n.t`.
// The stub below is the minimum surface we need to exercise create() +
// getState() without booting a real editor.
function makeFakeMuya(): Muya {
    return {
        i18n: { t: (s: string) => s },
        options: {
            autoPairBracket: false,
            autoPairMarkdownSyntax: false,
            autoPairQuote: false,
        },
        editor: {
            inlineRenderer: {
                patch: () => {},
                getLabelInfo: () => ({ label: '' }),
            },
            // scrollPage is only used to refresh ref-link/image labels — null
            // short-circuits ParagraphContent.update.
            scrollPage: null,
        },
    } as unknown as Muya;
}

const baseState: IFootnoteBlockState = {
    name: 'footnote',
    meta: { identifier: 'foo' },
    children: [{ name: 'paragraph', text: 'hello world' }],
};

describe('footnote block — registration', () => {
    it('scrollPage.loadBlock("footnote") returns the Footnote class after registerBlocks()', () => {
        const Block = ScrollPage.loadBlock('footnote');
        expect(Block).toBeDefined();
        expect(Block).toBe(Footnote);
    });
});

describe('footnote block — class API', () => {
    it('create() returns a Footnote whose getState() round-trips the input state', () => {
        const muya = makeFakeMuya();
        const block = Footnote.create(muya, baseState);
        expect(block).toBeInstanceOf(Footnote);
        expect(block.getState()).toEqual(baseState);
    });

    it('mutating meta.identifier is reflected in subsequent getState()', () => {
        const muya = makeFakeMuya();
        const block = Footnote.create(muya, baseState);
        block.meta.identifier = 'renamed';
        const next = block.getState();
        expect(next.meta.identifier).toBe('renamed');
        // children stay intact when only meta changes.
        expect(next.children).toEqual(baseState.children);
    });

    it('remove("api") detaches the block DOM and clears its parent link', () => {
        const muya = makeFakeMuya();
        const block = Footnote.create(muya, baseState);
        const parentDom = document.createElement('div');
        parentDom.appendChild(block.domNode!);
        // Plug into a minimal fake Parent so remove('api') walks the tree
        // without dispatching ot-json1 operations against a real editor.
        block.parent = {
            children: { remove: () => {} },
            domNode: parentDom,
        } as never;

        block.remove('api');

        expect(parentDom.contains(block.domNode!)).toBe(false);
        expect(block.parent).toBeNull();
    });
});

describe('footnote definition — paragraph-style editing', () => {
    it('loads a footnote definition as a normal paragraph and renders marker parts like reference definitions', () => {
        const muya = bootMuya('[^note]: body\n', { footnote: true });
        const content = contentByText(muya, '[^note]: body');

        expect(content.text).toBe('[^note]: body');
        expect(muya.domNode.querySelector('.mu-footnote-input')).toBeNull();
        expect(muya.domNode.querySelector('.mu-reference-label')?.textContent).toBe('note');
    });

    it('syncs edits through the paragraph text model', async () => {
        const muya = bootMuya('[^note]: body\n', { footnote: true });
        const content = contentByText(muya, '[^note]: body');

        content.text = '[^not]: body';
        content.update();

        await flush();

        expect(muya.getMarkdown()).toBe('[^not]: body\n');
    });

    it('falls back to plain paragraph rendering when the marker syntax is damaged', async () => {
        const muya = bootMuya('[^note]: body\n', { footnote: true });
        const content = contentByText(muya, '[^note]: body');

        content.text = '[^note: body';
        content.update();

        await flush();

        const state = muya.getState();
        expect(state[0].name).toBe('paragraph');
        expect((state[0] as { text: string }).text).toBe('[^note: body');
        expect(muya.domNode.querySelector('.mu-reference-label')).toBeNull();
    });

    it('renders an empty reference label and empty content as definition parts', () => {
        const muya = bootMuya('[]:\n', { footnote: true });
        const content = contentByText(muya, '[]:');
        const markers = Array.from(muya.domNode.querySelectorAll('.mu-reference-marker'))
            .map(node => node.textContent);

        expect(content.text).toBe('[]:');
        expect(markers.slice(0, 2)).toEqual(['[', ']:']);
        expect(muya.domNode.querySelector('.mu-reference-label')?.textContent).toBe('');
        expect(muya.domNode.querySelector('.mu-reference-definition-url')?.textContent).toBe('');
    });

    it('renders an empty footnote identifier and empty content as footnote definition parts', () => {
        const muya = bootMuya('[^]:\n', { footnote: true });
        const content = contentByText(muya, '[^]:');
        const markers = Array.from(muya.domNode.querySelectorAll('.mu-reference-marker'))
            .map(node => node.textContent);

        expect(content.text).toBe('[^]:');
        expect(markers).toEqual(['[^', ']:']);
        expect(muya.domNode.querySelector('.mu-reference-label')?.textContent).toBe('');
        expect(muya.domNode.querySelector('.mu-footnote-definition-content')?.textContent).toBe('');
    });

    it('uses note / note-2 for new footnotes instead of numeric identifiers', async () => {
        const muya = bootMuya('[^note]: existing\n', { footnote: true });

        muya.insertFootnote();

        await flush();
        const paragraphs = muya.getState().filter((state): state is { name: 'paragraph'; text: string } => state.name === 'paragraph');
        expect(paragraphs.map(block => block.text)).toEqual(['[^note]: existing', '[^note-2]: ']);
    });
});

describe('footnote block — markdown round-trip via state', () => {
    function roundTrip(md: string): string {
        const states = new MarkdownToState({
            footnote: true,
            math: false,
            isGitlabCompatibilityEnabled: false,
            trimUnnecessaryCodeBlockEmptyLines: false,
            frontMatter: false,
        }).generate(md);
        return new ExportMarkdown({ listIndentation: 1 }).generate(states);
    }

    it('round-trips a simple footnote reference + definition', () => {
        const md = `foo[^1]

[^1]: bar
`;
        expect(roundTrip(md)).toBe(md);
    });

    it('flattens a multi-line footnote definition to paragraph text for editing', () => {
        const md = `text[^n]

[^n]: - item a
    - item b
`;
        const states = new MarkdownToState({
            footnote: true,
            math: false,
            isGitlabCompatibilityEnabled: false,
            trimUnnecessaryCodeBlockEmptyLines: false,
            frontMatter: false,
        }).generate(md);

        const definition = states.find((state): state is { name: 'paragraph'; text: string } => (
            state.name === 'paragraph' && state.text.startsWith('[^n]:')
        ));

        expect(definition).toBeDefined();
        expect(definition!.text).toBe('[^n]: - item a - item b');
    });
});
