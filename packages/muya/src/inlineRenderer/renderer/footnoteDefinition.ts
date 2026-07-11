import type { FootnoteDefinitionToken, ISyntaxRenderOptions } from '../types';
import type Renderer from './index';
import { CLASS_NAMES } from '../../config';

export default function footnoteDefinition(
    this: Renderer,
    { h, block, token }: ISyntaxRenderOptions & { token: FootnoteDefinitionToken },
) {
    const { leftMarker, label, rightMarker, content } = token;
    const { start } = token.range;
    const labelStart = start + leftMarker.length;
    const labelEnd = labelStart + label.length;
    const rightMarkerEnd = labelEnd + rightMarker.length;
    const contentEnd = rightMarkerEnd + content.length;

    const leftMarkerContent = this.highlight(
        h,
        block,
        start,
        labelStart,
        token,
    );
    const labelContent = this.highlight(
        h,
        block,
        labelStart,
        labelEnd,
        token,
    );
    const rightMarkerContent = this.highlight(
        h,
        block,
        labelEnd,
        rightMarkerEnd,
        token,
    );
    const bodyContent = this.highlight(
        h,
        block,
        rightMarkerEnd,
        contentEnd,
        token,
    );

    return [
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, leftMarkerContent),
        h(`span.${CLASS_NAMES.MU_REFERENCE_LABEL}`, { attrs: { spellcheck: 'false' } }, labelContent),
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, rightMarkerContent),
        h('span.mu-footnote-definition-content', bodyContent),
    ];
}
