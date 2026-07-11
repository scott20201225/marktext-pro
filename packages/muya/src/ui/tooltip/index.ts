// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck

import type { Muya } from '../../index';
import './index.css';

function position(source, ele) {
    const rect = source.getBoundingClientRect();
    const { top, right, height } = rect;

    Object.assign(ele.style, {
        top: `${top + height + 15}px`,
        left: `${right - ele.offsetWidth / 2 - 10}px`,
    });
}

class Tooltip {
    private _muya: Muya;
    private _cache: Map<HTMLElement, HTMLElement>;

    constructor(muya) {
        this._muya = muya;
        this._cache = new Map();
        const { eventCenter } = this._muya;

        eventCenter.attachDOMEvent(
            document,
            'mouseover',
            this._mouseOver.bind(this),
        );
    }

    private _mouseOver(event) {
        const { target } = event;
        const toolTipTarget = target instanceof Element ? target.closest('[data-tooltip]') : null;
        const { eventCenter } = this._muya;
        if (toolTipTarget && !this._cache.has(toolTipTarget)) {
            const tooltip = toolTipTarget.getAttribute('data-tooltip');
            if (!tooltip)
                return;
            const tooltipEle = document.createElement('div');
            tooltipEle.textContent = tooltip;
            tooltipEle.classList.add('mu-tooltip');
            document.body.appendChild(tooltipEle);
            position(toolTipTarget, tooltipEle);

            this._cache.set(toolTipTarget, tooltipEle);

            setTimeout(() => {
                tooltipEle.classList.add('active');
            });

            const timer = setInterval(() => {
                if (!document.body.contains(toolTipTarget)) {
                    this._mouseLeave({ target: toolTipTarget });
                    clearInterval(timer);
                }
            }, 300);

            eventCenter.attachDOMEvent(
                toolTipTarget,
                'mouseleave',
                this._mouseLeave.bind(this),
            );
        }
    }

    private _mouseLeave(event) {
        const { target } = event;
        if (this._cache.has(target)) {
            const tooltipEle = this._cache.get(target);
            tooltipEle.remove();
            this._cache.delete(target);
        }
    }

    destroy() {
        for (const tooltip of this._cache.values())
            tooltip.remove();

        this._cache.clear();
    }
}

export default Tooltip;
