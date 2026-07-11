const svgIcon = (body: string) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
            <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                ${body}
            </g>
        </svg>
    `)}`;

const insertRowAboveIcon = svgIcon(`
    <path d="M3 3.25h10v9.5H3z" />
    <path d="M5 7.25h6" />
    <path d="M5 10.25h6" />
    <path d="M8 1.5v3" />
    <path d="M6.5 3h3" />
`);

const insertRowBelowIcon = svgIcon(`
    <path d="M3 3.25h10v9.5H3z" />
    <path d="M5 5.75h6" />
    <path d="M5 8.75h6" />
    <path d="M8 11.5v3" />
    <path d="M6.5 13h3" />
`);

const appendRowIcon = svgIcon(`
    <path d="M3 2.5h10v8.5H3z" />
    <path d="M5 5.5h6" />
    <path d="M5 8h6" />
    <path d="M8 10.75v3.25" />
    <path d="M6.5 12.375h3" />
`);

const moveRowUpIcon = svgIcon(`
    <path d="M3 2.5h10v11H3z" />
    <path d="M5.25 6.25h5.5" />
    <path d="M5.25 9.5h5.5" />
    <path d="M12.5 7.25V3.25" />
    <path d="m10.75 5 1.75-1.75L14.25 5" />
`);

const moveRowDownIcon = svgIcon(`
    <path d="M3 2.5h10v11H3z" />
    <path d="M5.25 5.5h5.5" />
    <path d="M5.25 8.75h5.5" />
    <path d="M12.5 8.75v4" />
    <path d="m10.75 11 1.75 1.75L14.25 11" />
`);

const removeRowIcon = svgIcon(`
    <path d="M3 2.5h10v11H3z" />
    <path d="M5 5.5h6" />
    <path d="M5 8.75h6" />
    <path d="M4.75 12.25h6.5" />
    <path d="M11.5 11.25 14 13.75" />
    <path d="M14 11.25 11.5 13.75" />
`);

const actions = [
    {
        type: 'insert-row-above',
        tooltip: 'Insert Row Above',
        icon: insertRowAboveIcon,
    },
    {
        type: 'insert-row-below',
        tooltip: 'Insert Row Below',
        icon: insertRowBelowIcon,
    },
    {
        type: 'append-row',
        tooltip: 'Append Row',
        icon: appendRowIcon,
    },
    {
        type: 'move-row-up',
        tooltip: 'Move Row Up',
        icon: moveRowUpIcon,
    },
    {
        type: 'move-row-down',
        tooltip: 'Move Row Down',
        icon: moveRowDownIcon,
    },
    {
        type: 'remove-row',
        tooltip: 'Remove Row',
        icon: removeRowIcon,
    },
] as const;

export type TableRowToolAction = typeof actions[number];

export default actions;
