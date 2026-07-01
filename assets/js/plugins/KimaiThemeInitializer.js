/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*!
 * [KIMAI] KimaiThemeInitializer: initialize theme functionality
 */

import { Tooltip, Offcanvas } from 'bootstrap';
import KimaiPlugin from '../KimaiPlugin';
import KimaiPageLoader from '../widgets/KimaiPageLoader';

export default class KimaiThemeInitializer extends KimaiPlugin {

    init()
    {
        // the tooltip do not use data-bs-toggle="tooltip" so they can be mixed with data-toggle="modal"
        [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]')).map(function (tooltipTriggerEl) {
            return new Tooltip(tooltipTriggerEl);
        });

        // support for offcanvas elements
        const offcanvasElementList = document.querySelectorAll('.offcanvas');
        [...offcanvasElementList].map(offcanvasEl => new Offcanvas(offcanvasEl));

        // activate all form plugins
        /** @type {KimaiForm} FORMS */
        const FORMS = this.getContainer().getPlugin('form');
        FORMS.activateForm('div.page-wrapper form');

        this._registerModalAutofocus('#remote_form_modal');

        this.navProgress = document.getElementById('kimai-nav-progress');

        if (this.navProgress === null) {
            this.navProgress = document.createElement('div');
            this.navProgress.id = 'kimai-nav-progress';
            this.navProgress.className = 'kimai-nav-progress';
            this.navProgress.setAttribute('aria-hidden', 'true');
            this.navProgress.innerHTML = '<div class="progress progress-sm"><div class="progress-bar progress-bar-indeterminate"></div></div>';
            document.body.appendChild(this.navProgress);
        }

        this.overlay = null;
        this.overlayTimeout = null;

        // register a global event listener, which displays an overlays upon notification
        document.addEventListener('kimai.reloadContent', (event) => {
            const showOverlay = () => {
                let container = 'div.page-wrapper';
                let useLocal = false;

                if (typeof event.detail === 'string') {
                    container = event.detail;
                } else if (event.detail !== undefined && event.detail !== null) {
                    container = event.detail.container ?? container;
                    useLocal = event.detail.local === true;
                }

                const containerElement = document.querySelector(container);

                if (containerElement === null) {
                    return;
                }

                if (useLocal && container === 'div.page-body') {
                    this.navProgress?.classList.add('is-visible');

                    return;
                }

                if (this.overlay !== null) {
                    return;
                }

                if (useLocal) {
                    containerElement.classList.add('is-navigating');
                }

                const temp = document.createElement('div');
                temp.innerHTML = '<div class="' + (useLocal ? 'overlay overlay-local' : 'overlay') + '"><div class="progress progress-sm"><div class="progress-bar progress-bar-indeterminate"></div></div></div>';
                this.overlay = temp.firstElementChild;
                containerElement.append(this.overlay);
            };

            if (this.overlayTimeout !== null) {
                clearTimeout(this.overlayTimeout);
            }

        // Delay overlay so fast responses never flash a loader
            this.overlayTimeout = window.setTimeout(() => {
                showOverlay();
                this.overlayTimeout = null;
            }, 80);
        });

        // register a global event listener, which hides an overlay upon notification
        document.addEventListener('kimai.reloadedContent', () => {
            if (this.overlayTimeout !== null) {
                clearTimeout(this.overlayTimeout);
                this.overlayTimeout = null;
            }

            this.navProgress?.classList.remove('is-visible');

            document.querySelectorAll('.page-body.is-navigating').forEach((element) => {
                element.classList.remove('is-navigating');
            });

            if (this.overlay !== null) {
                this.overlay.remove();
                this.overlay = null;
            }
        });

        document.addEventListener('kimai.reloadPage', () => {
            KimaiPageLoader.reinitialize();
        });
    }

    /**
     * Helps to set the autofocus on modals.
     *
     * @param {string} selector
     */
    _registerModalAutofocus(selector) {
        // on mobile you do not want to trigger the virtual keyboard upon modal open
        if (this.isMobile()) {
            return;
        }

        const modal = document.querySelector(selector);
        if (modal === null) {
            return;
        }

        modal.addEventListener('shown.bs.modal', () => {
            const form = modal.querySelector('form');
            let formAutofocus = form.querySelectorAll('[autofocus]');
            if (formAutofocus.length < 1) {
                formAutofocus = form.querySelectorAll('input[type=text],input[type=date],textarea,select');
            }
            if (formAutofocus.length > 0) {
                formAutofocus[0].focus();
            }
        });
    }
}
