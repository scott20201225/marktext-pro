import type { Muya } from '../../../muya';
import type { IBlockQuoteState } from '../../../state/types';
import { admonitionTitle, createAdmonitionIcon } from '../../../state/admonition';
import { mixins } from '../../../utils';
import Parent from '../../base/parent';
import IContainerQueryBlock from '../../mixins/containerQueryBlock';
import { ScrollPage } from '../../scrollPage';

@mixins(IContainerQueryBlock)
class BlockQuote extends Parent {
    public meta?: IBlockQuoteState['meta'];

    static override blockName = 'block-quote';

    static create(muya: Muya, state: IBlockQuoteState) {
        const blockQuote = new BlockQuote(muya, state);

        for (const child of state.children)
            blockQuote.append(ScrollPage.loadBlock(child.name).create(muya, child));

        return blockQuote;
    }

    override get path() {
        const { path: pPath } = this.parent!;
        const offset = this.parent!.offset(this);

        return [...pPath, offset, 'children'];
    }

    constructor(muya: Muya, state?: IBlockQuoteState) {
        super(muya);
        this.meta = state?.meta ? { ...state.meta } : undefined;
        this.tagName = 'blockquote';
        this.classList = ['mu-block-quote'];
        if (this.meta?.admonitionType)
            this.classList.push('mu-admonition', `mu-admonition-${this.meta.admonitionType}`);
        this.createDomNode();

        if (this.meta?.admonitionType) {
            const title = document.createElement('span');
            title.className = 'mu-admonition-title';
            title.setAttribute('contenteditable', 'false');

            title.appendChild(createAdmonitionIcon(document, this.meta.admonitionType, 'mu-admonition-icon'));

            const titleText = document.createElement('span');
            titleText.className = 'mu-admonition-title-text';
            titleText.textContent = muya.i18n.t(admonitionTitle(this.meta.admonitionType));
            title.appendChild(titleText);

            this.domNode!.appendChild(title);
        }
    }

    override getState(): IBlockQuoteState {
        const state: IBlockQuoteState = {
            name: 'block-quote',
            meta: this.meta ? { ...this.meta } : undefined,
            children: this.children.map(child => (child as Parent).getState()),
        };

        return state;
    }
}

export default BlockQuote;
