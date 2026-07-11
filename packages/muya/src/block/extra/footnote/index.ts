import type { Muya } from '../../../muya';
import type { IFootnoteBlockMeta, IFootnoteBlockState } from '../../../state/types';
import diff from 'fast-diff';
import { CLASS_NAMES } from '../../../config';
import { diffToTextOp, mixins } from '../../../utils';
import Parent from '../../base/parent';
import IContainerQueryBlock from '../../mixins/containerQueryBlock';
import { ScrollPage } from '../../scrollPage';

const DEFAULT_FOOTNOTE_IDENTIFIER = 'note';
const FOOTNOTE_IDENTIFIER_DISALLOWED = /[\s^[\]]+/g;
const FOOTNOTE_MARKER_REG = /^\[\^([^^[\]\s]+)\]:$/;

function sanitizeFootnoteIdentifier(value: string) {
    return value.replace(FOOTNOTE_IDENTIFIER_DISALLOWED, '');
}

function footnoteMarker(identifier: string) {
    return `[^${identifier}]:`;
}

function parseFootnoteMarker(value: string) {
    const match = FOOTNOTE_MARKER_REG.exec(value);
    return match ? match[1] : null;
}

@mixins(IContainerQueryBlock)
class Footnote extends Parent {
    public meta: IFootnoteBlockMeta;

    private _identifierLabel: HTMLElement | null = null;
    private _isComposingIdentifier = false;

    static override blockName = 'footnote';

    static create(muya: Muya, state: IFootnoteBlockState) {
        const footnote = new Footnote(muya, state);

        // Render the full `[^id]:` marker as a real editable DOM span
        // (not a tracked Parent). Typora keeps footnote name and body as
        // separate editable islands; we do the same and sync the marker text
        // back to `meta.identifier` after native editing finishes.
        const label = footnote._createIdentifierLabel(state.meta.identifier);
        footnote.domNode!.appendChild(label);

        for (const child of state.children)
            footnote.append(ScrollPage.loadBlock(child.name).create(muya, child));

        // Backlink arrow in the bottom-right of the figure. Clicking it
        // scrolls back up to the first inline `<sup id="noteref-{id}">`
        // reference.
        const backlink = document.createElement('i');
        backlink.className = CLASS_NAMES.MU_FOOTNOTE_BACKLINK;
        backlink.textContent = '↩︎';
        backlink.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const target = document.querySelector(
                `#noteref-${footnote.meta.identifier}`,
            );
            target?.scrollIntoView({ behavior: 'smooth' });
        });
        footnote.domNode!.appendChild(backlink);

        return footnote;
    }

    // Container-block path semantics: descendants address into `children`.
    // `Parent.getJsonPath` strips the trailing 'children' segment via
    // `isContainerBlock`, which we override below so footnote participates in
    // the same json1 op routing.
    override get path() {
        const { path: pPath } = this.parent!;
        const offset = this.parent!.offset(this);

        return [...pPath, offset, 'children'];
    }

    protected override get isContainerBlock() {
        return true;
    }

    constructor(muya: Muya, { meta }: IFootnoteBlockState) {
        super(muya);
        this.tagName = 'figure';
        this.meta = { identifier: sanitizeFootnoteIdentifier(meta.identifier) || DEFAULT_FOOTNOTE_IDENTIFIER };
        this.classList = [CLASS_NAMES.MU_FOOTNOTE];
        this.createDomNode();
    }

    override getState(): IFootnoteBlockState {
        return {
            name: 'footnote',
            meta: { identifier: this.meta.identifier },
            children: this.children.map(child => (child as Parent).getState()),
        };
    }

    focusIdentifierAtEnd() {
        this._placeIdentifierCursorAtIdentifierEnd();
    }

    private _createIdentifierLabel(identifier: string) {
        const label = document.createElement('span');
        label.className = CLASS_NAMES.MU_FOOTNOTE_INPUT;
        label.textContent = footnoteMarker(sanitizeFootnoteIdentifier(identifier) || DEFAULT_FOOTNOTE_IDENTIFIER);
        label.setAttribute('contenteditable', 'true');
        label.setAttribute('spellcheck', 'false');

        label.addEventListener('mousedown', event => event.stopPropagation());
        label.addEventListener('mouseup', event => event.stopPropagation());
        label.addEventListener('click', event => event.stopPropagation());
        label.addEventListener('beforeinput', (event) => {
            event.stopPropagation();
            if (
                event.inputType === 'insertParagraph'
                || event.inputType === 'insertLineBreak'
            ) {
                event.preventDefault();
            }
        });
        label.addEventListener('keydown', event => this._handleIdentifierKeydown(event));
        label.addEventListener('compositionstart', (event) => {
            event.stopPropagation();
            this._isComposingIdentifier = true;
        });
        label.addEventListener('compositionend', (event) => {
            event.stopPropagation();
            this._isComposingIdentifier = false;
            this._handleIdentifierInput();
        });
        label.addEventListener('input', (event) => {
            event.stopPropagation();
            if (!this._isComposingIdentifier)
                this._handleIdentifierInput();
        });
        label.addEventListener('paste', (event) => {
            event.stopPropagation();
        });
        label.addEventListener('blur', () => {
            if (!this.parent)
                return;

            if (!parseFootnoteMarker(label.textContent ?? '')) {
                this._unwrapDefinition();
                return;
            }

            this._syncIdentifierLabel();
        });

        this._identifierLabel = label;
        return label;
    }

    private _handleIdentifierKeydown(event: KeyboardEvent) {
        event.stopPropagation();

        if (event.key === 'Enter') {
            event.preventDefault();
            return;
        }

        if (event.key === 'ArrowRight' && !event.shiftKey && this._isIdentifierCursorAtEnd()) {
            event.preventDefault();
            this.firstContentInDescendant()?.setCursor(0, 0, true);
        }
    }

    private _unwrapDefinition() {
        if (!this.parent)
            return;

        let cursorBlock = null;
        this.forEach((node, i: number) => {
            if (!node.isParent())
                return;

            const block = node.clone() as Parent;
            this.parent!.insertBefore(block, this);
            if (i === 0)
                cursorBlock = block.firstContentInDescendant();
        });

        this.remove();
        cursorBlock?.setCursor(0, 0, true);
    }

    private _handleIdentifierInput() {
        const label = this._identifierLabel;
        if (!label)
            return;

        const rawMarker = label.textContent ?? '';
        const identifier = parseFootnoteMarker(rawMarker);

        if (!identifier) {
            this._unwrapDefinition();
            return;
        }

        this._setIdentifier(identifier);
    }

    private _getIdentifierSelectionRange() {
        const label = this._identifierLabel;
        const selection = document.getSelection();
        if (!label || !selection || selection.rangeCount === 0)
            return null;

        const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
        if (
            !anchorNode
            || !focusNode
            || !label.contains(anchorNode)
            || !label.contains(focusNode)
        ) {
            return null;
        }

        const offsetOf = (node: Node, offset: number) => {
            const range = document.createRange();
            range.selectNodeContents(label);
            range.setEnd(node, offset);
            return range.toString().length;
        };

        const anchor = offsetOf(anchorNode, anchorOffset);
        const focus = offsetOf(focusNode, focusOffset);

        return {
            start: Math.min(anchor, focus),
            end: Math.max(anchor, focus),
        };
    }

    private _isIdentifierCursorAtEnd() {
        const label = this._identifierLabel;
        const selection = this._getIdentifierSelectionRange();
        if (!label || !selection || selection.start !== selection.end)
            return false;

        return selection.start === (label.textContent ?? '').length;
    }

    private _setIdentifier(identifier: string) {
        const nextIdentifier = sanitizeFootnoteIdentifier(identifier) || DEFAULT_FOOTNOTE_IDENTIFIER;
        const oldIdentifier = this.meta.identifier;
        if (oldIdentifier === nextIdentifier)
            return;

        this.meta.identifier = nextIdentifier;

        if (this.parent) {
            const path = this.path;
            path.pop();
            path.push('meta', 'identifier');
            this.jsonState.editOperation(path, diffToTextOp(diff(oldIdentifier, nextIdentifier)));
        }

        this._syncIdentifierLabel();
    }

    private _syncIdentifierLabel() {
        const marker = footnoteMarker(this.meta.identifier);
        if (this._identifierLabel && this._identifierLabel.textContent !== marker)
            this._identifierLabel.textContent = marker;
    }

    private _placeIdentifierCursorAtIdentifierEnd() {
        this._placeIdentifierCursor(2 + this.meta.identifier.length);
    }

    private _placeIdentifierCursor(offset: number) {
        const label = this._identifierLabel;
        if (!label)
            return;

        const textNode = label.firstChild;
        const range = document.createRange();
        if (textNode) {
            range.setStart(textNode, Math.min(offset, textNode.textContent?.length ?? 0));
        }
        else {
            range.setStart(label, 0);
        }
        range.collapse(false);

        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }
}

export default Footnote;
