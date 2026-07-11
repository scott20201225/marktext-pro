import type { VNode } from 'snabbdom';
import type TableBodyCell from '../../block/gfm/table/cell';

import type { Muya } from '../../index';
import type { MenuItem } from './config';
import { isWin } from '../../config';
import { h, patch } from '../../utils/snabbdom';
import BaseFloat from '../baseFloat';
import { resolveTableCellContext } from '../tableContext';
import { clearTableHighlight, getColumnHighlightCells, getRowHighlightCells, setTableHighlight } from '../tableHighlight';
import { toolList } from './config';
import './index.css';

const defaultOptions = {
    placement: 'bottom' as const,
    offsetOptions: {
        mainAxis: 0,
        crossAxis: 0,
        alignmentAxis: 0,
    },
    showArrow: false,
};

interface ITableInfo {
    barType: 'bottom' | 'right';
}

export class TableRowColumMenu extends BaseFloat {
    private static readonly HIGHLIGHT_OWNER = 'table-row-column-menu';
    static pluginName = 'tableBarTools';
    public override capturesContentKeydown = true;
    private _oldVNode: VNode | null = null;
    private _tableInfo: ITableInfo | null = null;
    private _block: TableBodyCell | null = null;
    private _tableBarContainer: HTMLDivElement = document.createElement('div');

    constructor(muya: Muya, options = {}) {
        const name = 'mu-table-bar-tools';
        const opts = Object.assign({}, defaultOptions, options);
        super(muya, name, opts);

        this.floatBox!.classList.add('mu-table-bar-tools');
        this.container!.appendChild(this._tableBarContainer);
        this.listen();
    }

    override listen() {
        super.listen();
        const { eventCenter } = this.muya;
        eventCenter.subscribe(
            'muya-table-bar',
            ({ reference, tableInfo, block }) => {
                if (reference) {
                    this._tableInfo = tableInfo;
                    this._block = block;
                    this._highlightTarget();
                    this.show(reference);
                    this.render();
                }
                else {
                    this.hide();
                }
            },
        );
        eventCenter.attachDOMEvent(this.container!, 'mouseenter', () => {
            this._highlightTarget();
        });
        eventCenter.attachDOMEvent(this.container!, 'mouseleave', () => {
            clearTableHighlight(TableRowColumMenu.HIGHLIGHT_OWNER);
        });
    }

    render() {
        const { _tableInfo: tableInfo, _oldVNode: oldVNode, _tableBarContainer: tableBarContainer } = this;
        if (!tableInfo)
            return;
        const { i18n } = this.muya;
        const renderArray: MenuItem[] = toolList[tableInfo.barType];
        const children = renderArray.map((item) => {
            const { label } = item;

            const selector = 'li.item';

            return h(
                selector,
                {
                    dataset: {
                        label: item.action,
                        tooltip: i18n.t(label),
                    },
                    attrs: {
                        title: i18n.t(label),
                    },
                    on: {
                        click: (event) => {
                            this.selectItem(event, item);
                        },
                    },
                },
                i18n.t(label),
            );
        });

        const vnode = h(
            'ul',
            {
                class: {
                    'no-group-separators': isWin,
                },
            },
            children,
        );

        if (oldVNode)
            patch(oldVNode, vnode);
        else
            patch(tableBarContainer, vnode);

        this._oldVNode = vnode;
    }

    selectItem(event: Event, item: MenuItem) {
        event.preventDefault();
        event.stopPropagation();

        const context = resolveTableCellContext(this._block);
        if (!context) {
            this.hide();
            return;
        }

        const { table, rowOffset: rowCount, columnOffset: columnCount } = context;
        const { location, action, target } = item;

        if (action === 'insert') {
            let cursorBlock = null;

            if (target === 'row') {
                const offset
                    = location === 'previous'
                        ? rowCount
                        : location === 'end'
                            ? table.rowCount
                            : rowCount + 1;
                cursorBlock = table.insertRow(offset);
            }
            else {
                const offset
                    = location === 'left'
                        ? columnCount
                        : location === 'end'
                            ? table.columnCount
                            : columnCount + 1;
                cursorBlock = table.insertColumn(offset);
            }

            if (cursorBlock)
                cursorBlock.setCursor(0, 0);
        }
        else if (action === 'move') {
            const cursorBlock = target === 'row'
                ? table.moveRow(rowCount, location as 'up' | 'down', columnCount)
                : table.moveColumn(columnCount, location as 'left' | 'right', rowCount);

            if (cursorBlock)
                cursorBlock.setCursor(0, 0);
        }
        else {
            // After a row/column delete, the caret used to live inside a
            // now-detached cell. The table
            // mutators now return a surviving neighbour cell's content so we
            // can re-anchor the caret on a still-attached cell.
            const cursorBlock = target === 'row'
                ? table.removeRow(rowCount)
                : table.removeColumn(columnCount);

            if (cursorBlock)
                cursorBlock.setCursor(0, 0);
        }

        this.hide();
    }

    override hide() {
        this._block = null;
        this._tableInfo = null;
        clearTableHighlight(TableRowColumMenu.HIGHLIGHT_OWNER);
        super.hide();
    }

    private _highlightTarget() {
        const { _block: block, _tableInfo: tableInfo } = this;
        if (!block || !tableInfo)
            return;

        const context = resolveTableCellContext(block);
        if (!context)
            return;

        const nextCells = tableInfo.barType === 'right'
            ? getRowHighlightCells(context.tableElement, context.rowOffset)
            : getColumnHighlightCells(context.tableElement, context.columnOffset);
        setTableHighlight(TableRowColumMenu.HIGHLIGHT_OWNER, nextCells);
    }
}
