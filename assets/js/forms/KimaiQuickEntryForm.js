/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import KimaiFormPlugin from './KimaiFormPlugin';
import { Dropdown } from 'bootstrap';

export default class KimaiQuickEntryForm extends KimaiFormPlugin {

    /**
     * @param {HTMLFormElement} form
     * @return boolean
     */
    supportsForm(form)
    {
        return form.name === 'quick_entry_form' || form.classList.contains('quick-entries');
    }

    init()
    {
        if (this._documentListenersReady === true) {
            return;
        }

        this._documentListenersReady = true;

        document.addEventListener('click', (event) => {
            const page = event.target.closest('.quick-entry-page');

            if (page === null) {
                return;
            }

            const form = KimaiQuickEntryForm.#findForm(page);

            if (form === null) {
                return;
            }

            if (event.target.closest('.add-item-link')) {
                this._addRow(event);

                return;
            }

            if (event.target.closest('.remove-item-link')) {
                this._removeRow(event);
            }
        });

        document.addEventListener('change', (event) => {
            const page = event.target.closest('.quick-entry-page');

            if (page === null) {
                return;
            }

            const form = KimaiQuickEntryForm.#findForm(page);

            if (form !== null) {
                this._recalculateTotals(form);
            }
        });

        document.addEventListener('kimai.reloadPage', () => {
            this.#refreshQuickEntryPage();
        });

        document.addEventListener('kimai.reloadedContent', () => {
            this.#refreshQuickEntryPage();
        });
    }

    /**
     * @param {HTMLFormElement} form
     */
    activateForm(form)
    {
        if (!this.supportsForm(form)) {
            return;
        }

        this._disableLockedForm(form);
        this._ensureDeleteColumn(form);
        this._initDurationDropdowns(form);
        this._initDurationSnap(form);
        this._recalculateTotals(form);
    }

    /**
     * @param {HTMLFormElement} form
     */
    destroyForm(form) // eslint-disable-line no-unused-vars
    {
    }

    /**
     * @param {Element|null} page
     * @returns {HTMLFormElement|null}
     */
    static #findForm(page)
    {
        if (page === null) {
            return null;
        }

        const form = page.querySelector('form.quick-entries, form[name="quick_entry_form"]');

        return form instanceof HTMLFormElement ? form : null;
    }

    #refreshQuickEntryPage()
    {
        const page = document.querySelector('.quick-entry-page');

        if (page === null) {
            return;
        }

        const form = KimaiQuickEntryForm.#findForm(page);

        if (form === null) {
            return;
        }

        this._disableLockedForm(form);
        this._ensureDeleteColumn(form);
        this._initDurationDropdowns(form);
        this._initDurationSnap(form);
        this._recalculateTotals(form);
    }

    /**
     * @param {HTMLFormElement} form
     * @private
     */
    _disableLockedForm(form)
    {
        if (form.dataset.locked !== '1') {
            return;
        }

        form.querySelectorAll('input, select, textarea, button.add-item-link, button.remove-item-link, .btn-duration-preset').forEach((element) => {
            if (element instanceof HTMLInputElement && element.type === 'hidden') {
                return;
            }

            element.disabled = true;
            element.setAttribute('readonly', 'readonly');
        });
    }

    /**
     * Ensures each row has a delete button inside the actions cell (never adds extra columns).
     *
     * @param {HTMLFormElement} form
     * @private
     */
    _ensureDeleteColumn(form)
    {
        if (form.dataset.locked === '1') {
            return;
        }

        const deleteTitle = form.dataset.labelDelete ?? 'Delete';

        form.querySelectorAll('tbody tr.qe-entry-week-row').forEach((row) => {
            if (row.dataset.hasExisting === undefined) {
                row.dataset.hasExisting = row.querySelector('.duration-input[disabled]') !== null ? '1' : '0';
            }

            const canRemove = row.querySelector('.duration-input[disabled]') === null
                && row.querySelector('.duration-input[data-running="1"]') === null;

            let cell = row.querySelector('td.qe-actions-cell');
            if (cell === null) {
                cell = document.createElement('td');
                cell.className = 'text-center qe-actions-cell';
                row.appendChild(cell);
            }

            let button = cell.querySelector('.remove-item-link');
            if (button === null) {
                button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn btn-ghost-danger btn-icon remove-item-link';
                button.title = deleteTitle;
                button.setAttribute('aria-label', deleteTitle);
                button.innerHTML = '<i class="icon far fa-trash-alt"></i>';
                cell.appendChild(button);
            }

            button.disabled = !canRemove;
        });
    }

    /**
     * Snaps manually entered durations to the configured minute increment.
     *
     * @param {HTMLFormElement} form
     * @private
     */
    _initDurationSnap(form)
    {
        const increment = this.getDateUtils().getTimesheetDurationIncrement();
        if (increment <= 0) {
            return;
        }

        form.querySelectorAll('.duration-input:not([disabled])').forEach((input) => {
            if (input.dataset.incrementSnap === '1') {
                return;
            }

            input.dataset.incrementSnap = '1';
            input.addEventListener('blur', () => {
                const snapped = this.getDateUtils().snapDurationString(input.value, increment);
                if (snapped !== input.value) {
                    input.value = snapped;
                    input.dispatchEvent(new Event('change', {bubbles: true}));
                }
            });
        });
    }

    /**
     * Bootstrap dropdowns inside overflow containers are clipped; use fixed positioning.
     *
     * @param {HTMLFormElement} form
     * @private
     */
    _initDurationDropdowns(form)
    {
        form.querySelectorAll('.duration-widget .btn-duration-preset[data-bs-toggle="dropdown"]').forEach((toggle) => {
            if (toggle.dataset.qePopperFixed === '1') {
                return;
            }

            toggle.dataset.qePopperFixed = '1';

            const existing = Dropdown.getInstance(toggle);

            if (existing !== null) {
                existing.dispose();
            }

            new Dropdown(toggle, {
                popperConfig(defaultBsPopperConfig) {
                    defaultBsPopperConfig.strategy = 'fixed';

                    return defaultBsPopperConfig;
                },
            });
        });
    }

    /**
     * @param {HTMLFormElement|null} form
     * @private
     */
    _recalculateTotals(form)
    {
        if (form === null) {
            return;
        }

        /** @type {KimaiDateUtils} DATES */
        const DATES = this.getPlugin('date');
        const allFields = form.getElementsByClassName('duration-input');
        const totalsPerDay = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
        let fullTotals = 0;

        for (const durationInput of allFields) {
            const row = durationInput.closest('tr.qe-entry-week-row');

            if (row !== null && row.classList.contains('d-none')) {
                continue;
            }

            const id = durationInput.id.replace(/_duration/, '').slice(-1);
            totalsPerDay[id] += DATES.getSecondsFromDurationString(durationInput.value);
        }

        for (const [id, total] of Object.entries(totalsPerDay)) {
            const cell = document.getElementById('qe-totals-day-' + id);

            if (cell !== null) {
                cell.innerText = DATES.formatSeconds(total);
                cell.classList.remove('text-danger', 'fw-bold');

                const maxSeconds = parseInt(cell.dataset.maxSeconds ?? '0', 10);
                if (maxSeconds > 0 && total > maxSeconds) {
                    cell.classList.add('text-danger', 'fw-bold');
                }
            }

            fullTotals += total;
        }

        const weekTotal = document.getElementById('qe-totals-week');

        if (weekTotal !== null) {
            weekTotal.innerText = DATES.formatSeconds(fullTotals);
        }

        const allRows = form.getElementsByClassName('qe-entry-week-row');

        for (const qeWeekRow of allRows) {
            if (qeWeekRow.classList.contains('d-none')) {
                continue;
            }

            const qeWeekRowFields = qeWeekRow.getElementsByClassName('duration-input');
            let totalsRow = 0;

            for (const durationInput of qeWeekRowFields) {
                totalsRow += DATES.getSecondsFromDurationString(durationInput.value);
            }

            const totalCell = qeWeekRow.getElementsByClassName('qe-totals-row')[0];

            if (totalCell !== undefined) {
                totalCell.innerText = DATES.formatSeconds(totalsRow);
            }
        }
    }

    /**
     * @param {Event} event
     * @private
     */
    _addRow(event)
    {
        event.preventDefault();

        const button = event.target.closest('.add-item-link');

        if (button === null) {
            return;
        }

        const page = button.closest('.quick-entry-page');
        const form = KimaiQuickEntryForm.#findForm(page);

        if (form === null) {
            return;
        }

        const collectionHolder = document.getElementById(button.dataset.collectionHolder);
        const collectionPrototype = document.getElementById(button.dataset.collectionPrototype);

        if (collectionHolder === null || collectionPrototype === null) {
            return;
        }

        const fakeNode = document.createElement('table');
        fakeNode.innerHTML = collectionPrototype
            .dataset
            .prototype
            .replace(
                /__name__/g,
                collectionHolder.dataset.index
            );

        let node = fakeNode.children[0];

        if (node.nodeName.toUpperCase() === 'TBODY') {
            node = node.children[0];
        }

        collectionHolder.appendChild(node);

        /** @type {KimaiFormSelect} FORM_SELECT */
        const FORM_SELECT = this.getPlugin('form-select');
        [].slice.call(node.querySelectorAll('.selectpicker')).map((element) => {
            FORM_SELECT.activateSelectPickerByElement(element);
        });

        collectionHolder.dataset.index++;
        this._ensureDeleteColumn(form);
        this._initDurationDropdowns(form);
        this._initDurationSnap(form);
        this._recalculateTotals(form);
    }

    /**
     * @param {Event} event
     * @private
     */
    _removeRow(event)
    {
        const button = event.target.closest('.remove-item-link');

        if (button === null || button.disabled) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const row = button.closest('tr.qe-entry-week-row');

        if (row === null) {
            return;
        }

        const form = KimaiQuickEntryForm.#findForm(row.closest('.quick-entry-page'));

        row.querySelectorAll('.duration-input').forEach((input) => {
            if (!input.disabled) {
                input.value = '';
                input.dispatchEvent(new Event('change', {bubbles: true}));
            }
        });

        if (row.dataset.hasExisting === '1') {
            row.classList.add('d-none');
            row.dataset.removed = '1';
        } else {
            row.remove();
        }

        this._recalculateTotals(form);
    }

}
