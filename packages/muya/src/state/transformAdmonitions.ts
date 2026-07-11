import {
    admonitionTitle,
    createAdmonitionIcon,
    parseAdmonitionMarker,
} from './admonition';

function transformBlockquote(blockquote: HTMLQuoteElement) {
    const firstChild = blockquote.firstElementChild;
    if (!(firstChild instanceof HTMLParagraphElement))
        return;

    const parsed = parseAdmonitionMarker(firstChild.textContent ?? '');
    if (!parsed)
        return;

    blockquote.classList.add('admonition', `admonition-${parsed.admonitionType}`);
    blockquote.setAttribute('data-admonition-type', parsed.admonitionType);

    const title = document.createElement('div');
    title.className = 'admonition-title';

    title.appendChild(createAdmonitionIcon(document, parsed.admonitionType, 'admonition-icon'));

    const titleText = document.createElement('span');
    titleText.className = 'admonition-title-text';
    titleText.textContent = admonitionTitle(parsed.admonitionType);
    title.appendChild(titleText);

    blockquote.insertBefore(title, firstChild);
    firstChild.remove();
}

export function transformAdmonitions(html: string): string {
    if (!html.includes('[!'))
        return html;

    const container = document.createElement('div');
    container.innerHTML = html;

    const blockquotes = container.querySelectorAll('blockquote');
    for (const blockquote of blockquotes) {
        if (blockquote instanceof HTMLQuoteElement)
            transformBlockquote(blockquote);
    }

    return container.innerHTML;
}
