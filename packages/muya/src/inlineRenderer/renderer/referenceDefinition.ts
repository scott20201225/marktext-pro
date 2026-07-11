import type { ISyntaxRenderOptions, ReferenceDefinitionToken } from '../types';
import type Renderer from './index';
import { CLASS_NAMES } from '../../config';
import { sanitizeHyperlink } from '../../utils/url';

export default function referenceDefinition(
    this: Renderer,
    { h, block, token }: ISyntaxRenderOptions & { token: ReferenceDefinitionToken },
) {
    const {
        leftBracket = '',
        label = '',
        backlash = '',
        rightBracket = '',
        leftHrefMarker = '',
        href = '',
        rightHrefMarker = '',
        leftTitleSpace = '',
        titleMarker = '',
        title = '',
    } = token;
    const { raw } = token;
    const { start, end } = token.range;
    const labelStart = start + leftBracket.length;
    const labelEnd = labelStart + label.length;
    const backlashEnd = labelEnd + backlash.length;
    const rightBracketEnd = backlashEnd + rightBracket.length;
    const leftHrefMarkerEnd = rightBracketEnd + leftHrefMarker.length;
    const hrefEnd = leftHrefMarkerEnd + href.length;
    const rightHrefMarkerEnd = hrefEnd + rightHrefMarker.length;
    const leftTitleSpaceEnd = rightHrefMarkerEnd + leftTitleSpace.length;
    const titleMarkerEnd = leftTitleSpaceEnd + titleMarker.length;
    const titleEnd = titleMarkerEnd + title.length;
    const leftBracketContent = this.highlight(
        h,
        block,
        start,
        start + leftBracket.length,
        token,
    );
    const labelContent = this.highlight(
        h,
        block,
        labelStart,
        labelEnd,
        token,
    );
    const rightBracketContent = this.highlight(
        h,
        block,
        backlashEnd,
        rightBracketEnd,
        token,
    );
    const leftHrefMarkerContent = this.highlight(
        h,
        block,
        rightBracketEnd,
        leftHrefMarkerEnd,
        token,
    );
    const hrefContent = this.highlight(
        h,
        block,
        leftHrefMarkerEnd,
        hrefEnd,
        token,
    );
    const rightHrefMarkerContent = this.highlight(
        h,
        block,
        hrefEnd,
        rightHrefMarkerEnd,
        token,
    );
    const leftTitleSpaceContent = this.highlight(
        h,
        block,
        rightHrefMarkerEnd,
        leftTitleSpaceEnd,
        token,
    );
    const leftTitleMarkerContent = this.highlight(
        h,
        block,
        leftTitleSpaceEnd,
        titleMarkerEnd,
        token,
    );
    const titleContent = this.highlight(
        h,
        block,
        titleMarkerEnd,
        titleEnd,
        token,
    );
    const rightContent = this.highlight(
        h,
        block,
        titleEnd,
        end,
        token,
    );
    const backlashStart = start + leftBracket.length + label.length;

    return [
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, leftBracketContent),
        h(
            `span.${CLASS_NAMES.MU_REFERENCE_LABEL}`,
            {
                attrs: {
                    spellcheck: 'false',
                },
            },
            labelContent,
        ),
        ...this.backlashInToken(
            h,
            backlash,
            CLASS_NAMES.MU_GRAY,
            backlashStart,
            token,
        ),
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, rightBracketContent),
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, leftHrefMarkerContent),
        h(
            `a.${CLASS_NAMES.MU_REFERENCE_LINK}.${CLASS_NAMES.MU_REFERENCE_DEFINITION_URL}.${CLASS_NAMES.MU_INLINE_RULE}`,
            {
                attrs: {
                    spellcheck: 'false',
                },
                props: {
                    href: sanitizeHyperlink(href),
                    title: title || undefined,
                },
                dataset: {
                    start: String(start),
                    end: String(end),
                    raw,
                },
            },
            hrefContent,
        ),
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, rightHrefMarkerContent),
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, leftTitleSpaceContent),
        h(`span.${CLASS_NAMES.MU_REFERENCE_MARKER}`, { attrs: { spellcheck: 'false' } }, leftTitleMarkerContent),
        h(`span.${CLASS_NAMES.MU_REFERENCE_TITLE}`, titleContent),
        h(
            `span.${CLASS_NAMES.MU_REFERENCE_MARKER}`,
            {
                attrs: {
                    spellcheck: 'false',
                },
            },
            rightContent,
        ),
    ];
}
