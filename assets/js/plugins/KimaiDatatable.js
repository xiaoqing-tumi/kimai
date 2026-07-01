/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*!
 * [KIMAI] KimaiDatatable: handles functionality for the datatable
 */

import KimaiPlugin from "../KimaiPlugin";
import KimaiContextMenu from "../widgets/KimaiContextMenu";
import KimaiPageLoader from "../widgets/KimaiPageLoader";

export default class KimaiDatatable extends KimaiPlugin {

    constructor(contentAreaSelector, tableSelector) {
        super();
        this._contentArea = contentAreaSelector;
        this._selector = tableSelector;
        this._reloadAbortController = null;
    }

    getId() {
        return 'datatable';
    }

    init() {
        document.addEventListener('kimai.reloadPage', () => {
            this._bindReloadEvents();
            this._registerContextMenuIfPresent();
        });

        this._bindReloadEvents();
        this._registerContextMenuIfPresent();
    }

    _bindReloadEvents() {
        if (this._reloadAbortController !== null) {
            this._reloadAbortController.abort();
            this._reloadAbortController = null;
        }

        const dataTable = document.querySelector(this._selector);

        if (dataTable === null) {
            return;
        }

        const events = dataTable.dataset['reloadEvent'];

        if (events === undefined) {
            return;
        }

        this._reloadAbortController = new AbortController();
        const signal = this._reloadAbortController.signal;
        const handle = () => { this.reloadDatatable(); };

        for (const eventName of events.split(' ')) {
            if (eventName === '') {
                continue;
            }

            document.addEventListener(eventName, handle, {signal});
        }

        document.addEventListener('pagination-change', handle, {signal});
        document.addEventListener('filter-change', handle, {signal});
    }

    _registerContextMenuIfPresent() {
        if (document.querySelector(this._selector) !== null) {
            this.registerContextMenu(this._selector);
        }
    }

    /**
     * @param {string} selector
     * @private
     */
    registerContextMenu(selector)
    {
        KimaiContextMenu.createForDataTable(selector);
    }

    reloadDatatable()
    {
        KimaiPageLoader.invalidateCache(document.location.href);

        const toolbarSelector = this.getContainer().getPlugin('toolbar').getSelector();

        /** @type {HTMLFormElement} form */
        const form = document.querySelector(toolbarSelector);
        const callback = (text) => {
            const temp = document.createElement('div');
            temp.innerHTML = text;
            const newContent = temp.querySelector(this._contentArea);
            document.querySelector(this._contentArea).replaceWith(newContent);
            this.registerContextMenu(this._selector);
            document.dispatchEvent(new Event('kimai.reloadedContent'));
        };

        document.dispatchEvent(new CustomEvent('kimai.reloadContent', {
            detail: {container: this._contentArea, local: true},
        }));

        if (form === null) {
            this.fetch(document.location)
                .then(response => {
                    response.text().then(callback);
                })
                .catch(() => {
                    document.location.reload();
                });
            return;
        }

        this.fetchForm(form)
        .then(response => {
            response.text().then(callback);
        })
        .catch(() => {
            form.submit();
        });
    }
}
