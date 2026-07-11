import type Table from '../../block/gfm/table';
import type TableBodyCell from '../../block/gfm/table/cell';
import type TableRow from '../../block/gfm/table/row';
import type TableInner from '../../block/gfm/table/table';

import { getTableInnerElement } from '../tableHighlight';

export interface TableCellContext {
    block: TableBodyCell;
    table: Table;
    row: TableRow;
    tableInner: TableInner;
    tableElement: HTMLTableElement;
    rowOffset: number;
    columnOffset: number;
}

export function resolveTableCellContext(block: TableBodyCell | null): TableCellContext | null {
    if (!block?.domNode?.isConnected)
        return null;

    const table = block.closestBlock('table') as Table | null;
    const row = block.closestBlock('table.row') as TableRow | null;
    if (!table || !row || !table.domNode?.isConnected)
        return null;

    const tableInner = table.firstChild as TableInner | null;
    const tableElement = getTableInnerElement(table);
    if (!tableInner || !tableElement?.isConnected)
        return null;

    return {
        block,
        table,
        row,
        tableInner,
        tableElement,
        rowOffset: tableInner.offset(row),
        columnOffset: row.offset(block),
    };
}
