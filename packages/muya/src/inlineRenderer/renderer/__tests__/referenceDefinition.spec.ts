// @vitest-environment happy-dom

import type Format from '../../../block/base/format';
import type { IRenderCursor } from '../../../selection/types';
import type { ReferenceDefinitionToken } from '../../types';
import type Renderer from '../index';
import { describe, expect, it } from 'vitest';
import { h } from '../../../utils/snabbdom';
import referenceDefinition from '../referenceDefinition';

interface IFakeRenderer {
    highlight: (
        h: typeof import('../../../utils/snabbdom').h,
        block: Format,
        start: number,
        end: number,
        token: ReferenceDefinitionToken,
    ) => string;
    backlashInToken: (
        h: typeof import('../../../utils/snabbdom').h,
        backlash: string,
        className: string,
        start: number,
        token: ReferenceDefinitionToken,
    ) => unknown[];
}

const fakeBlock = {} as unknown as Format;
const fakeCursor = {} as unknown as IRenderCursor;

function asRenderer(r: IFakeRenderer): Renderer {
    return r as unknown as Renderer;
}

function makeRenderer(): IFakeRenderer {
    return {
        highlight: (_h, _block, start, end, token) => token.raw.slice(start, end),
        backlashInToken: () => [],
    };
}

describe('reference definition renderer', () => {
    it('does not crash when optional title fields are missing', () => {
        const token = {
            type: 'reference_definition',
            raw: '[ref]: https://example.com',
            parent: [],
            range: { start: 0, end: '[ref]: https://example.com'.length },
            leftBracket: '[',
            label: 'ref',
            backlash: '',
            rightBracket: ']: ',
            leftHrefMarker: '',
            href: 'https://example.com',
            rightHrefMarker: '',
            leftTitleSpace: undefined,
            titleMarker: undefined,
            title: undefined,
            rightTitleSpace: '',
        } as unknown as ReferenceDefinitionToken;

        expect(() => {
            referenceDefinition.call(
                asRenderer(makeRenderer()),
                { h, block: fakeBlock, token, cursor: fakeCursor },
            );
        }).not.toThrow();
    });

    it('does not crash when the definition is still in a half-edited state', () => {
        const token = {
            type: 'reference_definition',
            raw: '[]: ',
            parent: [],
            range: { start: 0, end: 4 },
            leftBracket: '[',
            label: undefined,
            backlash: '',
            rightBracket: ']: ',
            leftHrefMarker: '',
            href: undefined,
            rightHrefMarker: '',
            leftTitleSpace: undefined,
            titleMarker: undefined,
            title: undefined,
            rightTitleSpace: '',
        } as unknown as ReferenceDefinitionToken;

        expect(() => {
            referenceDefinition.call(
                asRenderer(makeRenderer()),
                { h, block: fakeBlock, token, cursor: fakeCursor },
            );
        }).not.toThrow();
    });
});
