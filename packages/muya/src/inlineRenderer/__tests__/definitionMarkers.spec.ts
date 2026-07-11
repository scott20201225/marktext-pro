// @vitest-environment happy-dom

import type { Token } from '../types';
import { describe, expect, it } from 'vitest';
import { tokenizer } from '../lexer';

function topToken(src: string): Token | undefined {
    return tokenizer(src, {
        hasBeginRules: true,
        options: { superSubScript: true, footnote: true },
    })[0];
}

describe('inline lexer — definition markers', () => {
    it.each(['[]:', '[]: '])('keeps empty reference labels editable: %s', (src) => {
        const token = topToken(src);

        expect(token?.type).toBe('reference_definition');
        expect(token).toMatchObject({
            label: '',
            href: '',
            raw: src,
        });
    });

    it.each(['[^]:', '[^]: '])('keeps empty footnote identifiers editable: %s', (src) => {
        const token = topToken(src);

        expect(token?.type).toBe('footnote_definition');
        expect(token).toMatchObject({
            label: '',
            content: '',
            raw: src,
        });
    });

    it.each(['[^note]:', '[^note]: '])('keeps empty footnote content editable: %s', (src) => {
        const token = topToken(src);

        expect(token?.type).toBe('footnote_definition');
        expect(token).toMatchObject({
            label: 'note',
            content: '',
            raw: src,
        });
    });

    it('does not parse an empty footnote identifier as a reference label named caret', () => {
        const token = topToken('[^]: ');

        expect(token?.type).toBe('footnote_definition');
        expect(token).not.toMatchObject({
            type: 'reference_definition',
            label: '^',
        });
    });
});
