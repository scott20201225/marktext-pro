export const ADMONITION_TYPES = [
    'note',
    'tip',
    'caution',
    'warning',
    'important',
] as const;

export type TAdmonitionType = typeof ADMONITION_TYPES[number];

type TAdmonitionIconNode = {
    tag: 'circle' | 'line' | 'path';
    attrs: Record<string, string>;
};

const ADMONITION_MARKERS: Record<TAdmonitionType, string> = {
    note: 'NOTE',
    tip: 'TIP',
    caution: 'CAUTION',
    warning: 'WARNING',
    important: 'IMPORTANT',
};

const ADMONITION_TITLES: Record<TAdmonitionType, string> = {
    note: 'Note',
    tip: 'Tip',
    caution: 'Caution',
    warning: 'Warning',
    important: 'Important',
};

const ADMONITION_COLORS: Record<TAdmonitionType, string> = {
    note: '#2563eb',
    tip: '#059669',
    caution: '#d97706',
    warning: '#dc2626',
    important: '#7c3aed',
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const ADMONITION_ICON_ATTRS = {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.9',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
} as const;

const ADMONITION_ICON_NODES: Record<TAdmonitionType, readonly TAdmonitionIconNode[]> = {
    note: [
        { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
        { tag: 'line', attrs: { x1: '12', y1: '10', x2: '12', y2: '16' } },
        { tag: 'line', attrs: { x1: '12', y1: '7', x2: '12', y2: '7.01' } },
    ],
    tip: [
        {
            tag: 'path',
            attrs: {
                d: 'M9 18h6',
            },
        },
        {
            tag: 'path',
            attrs: {
                d: 'M10 22h4',
            },
        },
        {
            tag: 'path',
            attrs: {
                d: 'M8 14c.2-.8-.1-1.7-.7-2.3A6 6 0 1 1 16.7 11.7c-.6.6-.9 1.5-.7 2.3',
            },
        },
    ],
    caution: [
        {
            tag: 'path',
            attrs: {
                d: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
            },
        },
        { tag: 'line', attrs: { x1: '12', y1: '9', x2: '12', y2: '13' } },
        { tag: 'line', attrs: { x1: '12', y1: '17', x2: '12', y2: '17.01' } },
    ],
    warning: [
        { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
        { tag: 'path', attrs: { d: 'M12 7v6' } },
        { tag: 'line', attrs: { x1: '12', y1: '16.5', x2: '12', y2: '16.51' } },
    ],
    important: [
        {
            tag: 'path',
            attrs: {
                d: 'm12 3 2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 15l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76Z',
            },
        },
    ],
};

const MARKER_RE = /^\s*\[!([A-Z]+)\]\s*$/;

export function isAdmonitionType(value: string): value is TAdmonitionType {
    return (ADMONITION_TYPES as readonly string[]).includes(value);
}

export function admonitionMarker(type: TAdmonitionType) {
    return `[!${ADMONITION_MARKERS[type]}]`;
}

export function admonitionTitle(type: TAdmonitionType) {
    return ADMONITION_TITLES[type];
}

export function admonitionColor(type: TAdmonitionType) {
    return ADMONITION_COLORS[type];
}

export function admonitionIconNodes(type: TAdmonitionType) {
    return ADMONITION_ICON_NODES[type];
}

export function createAdmonitionIcon(doc: Document, type: TAdmonitionType, className: string) {
    const svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    for (const [name, value] of Object.entries(ADMONITION_ICON_ATTRS))
        svg.setAttribute(name, value);

    for (const node of ADMONITION_ICON_NODES[type]) {
        const element = doc.createElementNS(SVG_NS, node.tag);
        for (const [name, value] of Object.entries(node.attrs))
            element.setAttribute(name, value);
        svg.appendChild(element);
    }

    return svg;
}

export function parseAdmonitionMarker(text: string): {
    admonitionType: TAdmonitionType;
} | null {
    const match = MARKER_RE.exec(text);
    if (!match)
        return null;

    const admonitionType = match[1].toLowerCase();
    if (!isAdmonitionType(admonitionType))
        return null;

    return {
        admonitionType,
    };
}
