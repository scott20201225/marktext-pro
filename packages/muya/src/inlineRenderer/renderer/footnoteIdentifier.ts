import type { FootnoteIdentifierToken, ISyntaxRenderOptions } from '../types';
import type Renderer from './index';
import { CLASS_NAMES } from '../../config';

export default function footnoteIdentifier(
    this: Renderer,
    {
        h,
        block,
        token,
    }: ISyntaxRenderOptions & { token: FootnoteIdentifierToken },
) {
    const { marker } = token;
    const { start, end } = token.range;

    const startMarker = this.highlight(
        h,
        block,
        start,
        start + marker.length,
        token,
    );
    const endMarker = this.highlight(h, block, end - 1, end, token);
    const content = this.highlight(
        h,
        block,
        start + marker.length,
        end - 1,
        token,
    );

    return [
        h(
            `span#noteref-${token.content}.${CLASS_NAMES.MU_INLINE_FOOTNOTE_IDENTIFIER}.${CLASS_NAMES.MU_INLINE_RULE}`,
            {
                attrs: {
                    spellcheck: 'false',
                },
            },
            [
                h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, startMarker),
                h(
                    'a',
                    {
                        attrs: {
                            spellcheck: 'false',
                        },
                    },
                    h(`span.${CLASS_NAMES.MU_REFERENCE_LABEL}`, content),
                ),
                h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, endMarker),
            ],
        ),
    ];
}
