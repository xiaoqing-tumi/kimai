/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*!
 * [KIMAI] KimaiDatatableColumnView: manages the visibility of data-table columns in cookies
 */

import KimaiPlugin from '../KimaiPlugin';

export default class KimaiDatatableColumnView extends KimaiPlugin {

    constructor(dataAttribute) {
        super();
        this.dataAttribute = dataAttribute;
    }

    getId() {
        return 'datatable-column-visibility';
    }

    init() {
        document.addEventListener('kimai.initialized', () => {
            this.activate();
        });

        document.addEventListener('kimai.reloadPage', () => {
            this.activate();
        });

        document.addEventListener('click', (event) => {
            this.#guardModalTrigger(event);
        }, true);

        this.activate();
    }

    activate() {
        document.querySelectorAll('[' + this.dataAttribute + ']').forEach((modal) => {
            if (!(modal instanceof HTMLElement) || modal.dataset.kimaiColumnViewBound === '1') {
                return;
            }

            modal.dataset.kimaiColumnViewBound = '1';
            this.#wireModal(modal);
        });
    }

    /**
     * @param {Event} event
     */
    #guardModalTrigger(event) {
        const trigger = event.target.closest('[data-bs-toggle="modal"][data-bs-target]');

        if (!(trigger instanceof HTMLElement)) {
            return;
        }

        const targetSelector = trigger.getAttribute('data-bs-target');

        if (targetSelector === null || !targetSelector.startsWith('#modal_')) {
            return;
        }

        const target = document.querySelector(targetSelector);

        if (target !== null) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
    }

    /**
     * @param {HTMLElement} modal
     */
    #wireModal(modal) {
        const tableId = modal.getAttribute(this.dataAttribute);

        if (tableId === null) {
            return;
        }

        modal.addEventListener('show.bs.modal', () => {
            this.#evaluateCheckboxes(modal, tableId);
        });

        const saveButton = modal.querySelector('button[data-type=save]');

        if (saveButton !== null) {
            saveButton.addEventListener('click', () => {
                this.#saveVisibility(modal);
            });
        }

        const resetButton = modal.querySelector('button[data-type=reset]');

        if (resetButton !== null) {
            resetButton.addEventListener('click', (event) => {
                this.#resetVisibility(modal, event.currentTarget);
            });
        }

        modal.querySelectorAll('input[name=datatable_profile]').forEach((element) => {
            element.addEventListener('change', () => {
                const form = modal.getElementsByTagName('form')[0];
                this.fetchForm(form, {}, element.getAttribute('data-href'))
                    .then(() => {
                        localStorage.setItem('kimai_profile', element.getAttribute('value'));
                        document.location.reload();
                    })
                    .catch(() => {
                        form.setAttribute('action', element.getAttribute('data-href'));
                        form.submit();
                    });
            });
        });

        modal.querySelectorAll('form input[type=checkbox]').forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                this.#changeVisibility(tableId, checkbox.getAttribute('name'), checkbox.checked);
            });
        });
    }

    /**
     * @param {HTMLElement} modal
     * @param {string} tableId
     */
    #evaluateCheckboxes(modal, tableId) {
        const form = modal.getElementsByTagName('form')[0];
        const table = document.getElementsByClassName('datatable_' + tableId)[0];

        if (form === undefined || table === undefined) {
            return;
        }

        for (const columnElement of table.getElementsByTagName('th')) {
            const fieldName = columnElement.getAttribute('data-field');

            if (fieldName === null) {
                continue;
            }

            const checkbox = form.querySelector('input[name=' + fieldName + ']');

            if (checkbox === null) {
                continue;
            }

            checkbox.checked = window.getComputedStyle(columnElement).display !== 'none';
        }
    }

    /**
     * @param {HTMLElement} modal
     */
    #saveVisibility(modal) {
        const form = modal.getElementsByTagName('form')[0];

        this.fetchForm(form)
            .then(() => {
                document.location.reload();
            })
            .catch(() => {
                form.submit();
            });
    }

    /**
     * @param {HTMLElement} modal
     * @param {HTMLElement} button
     */
    #resetVisibility(modal, button) {
        const form = modal.getElementsByTagName('form')[0];

        this.fetchForm(form, {}, button.getAttribute('formaction'))
            .then(() => {
                document.location.reload();
            })
            .catch(() => {
                form.setAttribute('action', button.getAttribute('formaction'));
                form.submit();
            });
    }

    /**
     * @param {string} tableId
     * @param {string} columnName
     * @param {boolean} checked
     */
    #changeVisibility(tableId, columnName, checked) {
        for (const tableBox of document.getElementsByClassName('datatable_' + tableId)) {
            let targetClasses = null;

            for (const element of tableBox.getElementsByClassName('col_' + columnName)) {
                if (targetClasses === null) {
                    let removeClass = '-none';
                    let addClass = 'd-table-cell';

                    if (!checked) {
                        removeClass = '-table-cell';
                        addClass = 'd-none';
                    }

                    targetClasses = '';
                    element.classList.forEach(
                        function (name) {
                            if (name.indexOf(removeClass) === -1) {
                                targetClasses += ' ' + name;
                            }
                        }
                    );

                    if (targetClasses.indexOf(addClass) === -1) {
                        targetClasses += ' ' + addClass;
                    }
                }

                element.className = targetClasses;
            }
        }
    }
}
