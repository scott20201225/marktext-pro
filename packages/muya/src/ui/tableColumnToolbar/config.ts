import alignCenterIcon from '../../assets/icons/align_center/2.png';
import alignLeftIcon from '../../assets/icons/align_left/2.png';
import alignRightIcon from '../../assets/icons/align_right/2.png';
import insertLeftIcon from '../../assets/icons/table_column/table-column-plus-left.png';
import insertRightIcon from '../../assets/icons/table_column/table-column-plus-right.png';
import removeColumnIcon from '../../assets/icons/table_column/table-column-remove.png';

const svgIcon = (body: string) =>
    `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
            <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                ${body}
            </g>
        </svg>
    `)}`;

const appendColumnIcon = svgIcon(`
    <path d="M2.5 3.25h7v9.5h-7z" />
    <path d="M6 5v6" />
    <path d="M12.5 5v6" />
    <path d="M11 8h3" />
    <path d="M12.5 6.5v3" />
`);

const moveColumnLeftIcon = svgIcon(`
    <path d="M2.5 3.25h11v9.5h-11z" />
    <path d="M5 5v6" />
    <path d="M9 5v6" />
    <path d="M12 5v6" />
    <path d="M7.5 8H2.75" />
    <path d="m4.75 6-2 2 2 2" />
`);

const moveColumnRightIcon = svgIcon(`
    <path d="M2.5 3.25h11v9.5h-11z" />
    <path d="M4 5v6" />
    <path d="M7 5v6" />
    <path d="M11 5v6" />
    <path d="M8.5 8h4.75" />
    <path d="m11.25 6 2 2-2 2" />
`);

const icons = [
    {
        type: 'left',
        tooltip: 'Align Left',
        icon: alignLeftIcon,
    },
    {
        type: 'center',
        tooltip: 'Align Center',
        icon: alignCenterIcon,
    },
    {
        type: 'right',
        tooltip: 'Align Right',
        icon: alignRightIcon,
    },
    {
        dividerBefore: true,
        type: 'insert left',
        tooltip: 'Insert Column left',
        icon: insertLeftIcon,
    },
    {
        type: 'insert right',
        tooltip: 'Insert Column right',
        icon: insertRightIcon,
    },
    {
        type: 'append',
        tooltip: 'Append Column',
        icon: appendColumnIcon,
    },
    {
        dividerBefore: true,
        type: 'move left',
        tooltip: 'Move Column Left',
        icon: moveColumnLeftIcon,
    },
    {
        type: 'move right',
        tooltip: 'Move Column Right',
        icon: moveColumnRightIcon,
    },
    {
        dividerBefore: true,
        type: 'remove',
        tooltip: 'Remove Column',
        icon: removeColumnIcon,
    },
];

export type TableColumnToolIcon = typeof icons[number];

export default icons;
