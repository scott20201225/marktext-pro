export interface MenuItem {
    label: string;
    action: 'insert' | 'move' | 'remove';
    location:
        | 'previous'
        | 'next'
        | 'current'
        | 'left'
        | 'right'
        | 'end'
        | 'up'
        | 'down';
    target: 'row' | 'column';
}

export const toolList: Record<'right' | 'bottom', MenuItem[]> = {
    right: [
        {
            label: 'Insert Row Above',
            action: 'insert',
            location: 'previous',
            target: 'row',
        },
        {
            label: 'Insert Row Below',
            action: 'insert',
            location: 'next',
            target: 'row',
        },
        {
            label: 'Append Row',
            action: 'insert',
            location: 'end',
            target: 'row',
        },
        {
            label: 'Move Row Up',
            action: 'move',
            location: 'up',
            target: 'row',
        },
        {
            label: 'Move Row Down',
            action: 'move',
            location: 'down',
            target: 'row',
        },
        {
            label: 'Remove Row',
            action: 'remove',
            location: 'current',
            target: 'row',
        },
    ],
    bottom: [
        {
            label: 'Insert Column Left',
            action: 'insert',
            location: 'left',
            target: 'column',
        },
        {
            label: 'Insert Column Right',
            action: 'insert',
            location: 'right',
            target: 'column',
        },
        {
            label: 'Append Column',
            action: 'insert',
            location: 'end',
            target: 'column',
        },
        {
            label: 'Move Column Left',
            action: 'move',
            location: 'left',
            target: 'column',
        },
        {
            label: 'Move Column Right',
            action: 'move',
            location: 'right',
            target: 'column',
        },
        {
            label: 'Remove Column',
            action: 'remove',
            location: 'current',
            target: 'column',
        },
    ],
};
