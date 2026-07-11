type HighlightOwner = string;

let currentOwner: HighlightOwner | null = null;
let currentCells: HTMLTableCellElement[] = [];

const HIGHLIGHT_CLASS = 'mu-table-target-highlight';

function sameCells(nextCells: HTMLTableCellElement[]) {
    return nextCells.length === currentCells.length
        && nextCells.every((cell, offset) => cell === currentCells[offset]);
}

export function clearTableHighlight(owner?: HighlightOwner) {
    if (owner && currentOwner !== owner)
        return;

    for (const cell of currentCells)
        cell.classList.remove(HIGHLIGHT_CLASS);

    currentOwner = null;
    currentCells = [];
}

export function setTableHighlight(owner: HighlightOwner, nextCells: HTMLTableCellElement[]) {
    if (currentOwner === owner && sameCells(nextCells))
        return;

    clearTableHighlight();

    for (const cell of nextCells)
        cell.classList.add(HIGHLIGHT_CLASS);

    currentOwner = owner;
    currentCells = nextCells;
}

export function getTableInnerElement(tableLike: unknown) {
    const element = (tableLike as { firstChild?: { domNode?: Element | null } | null })?.firstChild?.domNode;
    return element instanceof HTMLTableElement ? element : null;
}

export function getRowHighlightCells(tableElement: HTMLTableElement, rowOffset: number) {
    return Array.from(tableElement.querySelectorAll('tr')[rowOffset]?.children ?? [])
        .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement);
}

export function getColumnHighlightCells(tableElement: HTMLTableElement, columnOffset: number) {
    return Array.from(tableElement.querySelectorAll('tr'))
        .map(row => row.children.item(columnOffset))
        .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement);
}

export function getWholeTableHighlightCells(tableElement: HTMLTableElement) {
    return Array.from(tableElement.querySelectorAll('th, td'))
        .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement);
}
