/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import KimaiPlugin from '../KimaiPlugin';
import KimaiPageLoader from '../widgets/KimaiPageLoader';

export default class KimaiSidebarMenu extends KimaiPlugin {

    /** @type {string|null} */
    #lastNavigationHref = null;

    /** @type {number} */
    #lastNavigationTime = 0;

    init() {
        const sidebar = document.querySelector('.navbar-vertical #navbar-menu .navbar-nav');
        if (sidebar === null) {
            return;
        }

        KimaiPageLoader.initPopState();

        /** @type {NodeListOf<HTMLElement>} */
        const items = sidebar.querySelectorAll(':scope > .nav-item.dropdown');

        items.forEach((item) => {
            this.#initDropdownItem(item);
        });

        sidebar.addEventListener('mousedown', (event) => {
            this.#handleNavigationIntent(event);
        }, true);

        sidebar.addEventListener('click', (event) => {
            this.#suppressDuplicateNavigationClick(event);
        }, true);

        document.addEventListener('kimai.sidebarMenuSync', () => {
            sidebar.querySelectorAll(':scope > .nav-item.dropdown').forEach((item) => {
                this.#applyStoredState(item);
            });
        });

        this.#initLinkPrefetch(sidebar);
        KimaiPageLoader.scheduleIdlePrefetch();
    }

    /**
     * @param {HTMLElement} item
     */
    #initDropdownItem(item) {
        const toggle = item.querySelector(':scope > [data-kimai-sidebar-toggle]');
        const menu = item.querySelector(':scope > .dropdown-menu');

        if (toggle === null || menu === null) {
            return;
        }

        this.#applyStoredState(item);

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const storageKeys = this.#getStorageKeys(item);
            const willOpen = !menu.classList.contains('show');

            this.#setOpen(toggle, menu, willOpen, storageKeys);

            if (willOpen) {
                this.#prefetchMenuLinks(menu);
            }

            if (!willOpen && item.classList.contains('active')) {
                sessionStorage.setItem(storageKeys.collapsed, '1');
            }
        });
    }

    /**
     * @param {HTMLElement} item
     */
    #applyStoredState(item) {
        const toggle = item.querySelector(':scope > [data-kimai-sidebar-toggle]');
        const menu = item.querySelector(':scope > .dropdown-menu');

        if (toggle === null || menu === null) {
            return;
        }

        const storageKeys = this.#getStorageKeys(item);
        const isCollapsed = sessionStorage.getItem(storageKeys.collapsed) === '1';
        const isExpanded = sessionStorage.getItem(storageKeys.expanded) === '1';
        const shouldOpen = !isCollapsed && (menu.dataset.defaultOpen === '1' || isExpanded);

        this.#setOpen(toggle, menu, shouldOpen, storageKeys);
    }

    /**
     * @param {MouseEvent} event
     */
    #handleNavigationIntent(event) {
        if (event.button !== 0) {
            return;
        }

        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
        }

        const link = this.#resolveNavigationLink(event);

        if (link === null) {
            return;
        }

        const href = link.getAttribute('href');

        if (href === null || href === '' || href === '#' || href.startsWith('javascript:')) {
            return;
        }

        if (KimaiPageLoader.requiresFullPageLoad(href)) {
            KimaiPageLoader.prefetch(href);

            return;
        }

        this.#ensureDropdownOpen(link);

        event.preventDefault();

        const now = Date.now();

        if (this.#lastNavigationHref === href && (now - this.#lastNavigationTime) < 150) {
            return;
        }

        this.#lastNavigationHref = href;
        this.#lastNavigationTime = now;

        KimaiPageLoader.prefetch(href);
        KimaiPageLoader.navigate(href);
    }

    /**
     * @param {HTMLElement} sidebar
     */
    #initLinkPrefetch(sidebar) {
        sidebar.querySelectorAll('a[href]').forEach((link) => {
            if (!(link instanceof HTMLAnchorElement)) {
                return;
            }

            let prefetchTimer = null;

            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');

                if (href === null || href === '' || href === '#' || href.startsWith('javascript:')) {
                    return;
                }

                prefetchTimer = window.setTimeout(() => {
                    KimaiPageLoader.prefetch(href);
                }, KimaiPageLoader.requiresFullPageLoad(href) ? 0 : 80);
            });

            link.addEventListener('mouseleave', () => {
                if (prefetchTimer !== null) {
                    clearTimeout(prefetchTimer);
                    prefetchTimer = null;
                }
            });
        });
    }

    /**
     * @param {HTMLElement} menu
     */
    #prefetchMenuLinks(menu) {
        const urls = [];

        menu.querySelectorAll('a[href]').forEach((link) => {
            const href = link.getAttribute('href');

            if (href !== null && href !== '' && href !== '#' && !href.startsWith('javascript:')) {
                urls.push(href);
            }
        });

        KimaiPageLoader.prefetchAll(urls);
    }

    /**
     * @param {MouseEvent} event
     */
    #suppressDuplicateNavigationClick(event) {
        const link = this.#resolveNavigationLink(event);

        if (link === null) {
            return;
        }

        const href = link.getAttribute('href');

        if (href === null || href === '' || href === '#' || href.startsWith('javascript:')) {
            return;
        }

        if (KimaiPageLoader.requiresFullPageLoad(href)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * @param {HTMLElement} link
     */
    #ensureDropdownOpen(link) {
        const menu = link.closest('.dropdown-menu');

        if (menu === null || menu.classList.contains('show')) {
            return;
        }

        const item = menu.closest('.nav-item.dropdown');

        if (item === null) {
            return;
        }

        const toggle = item.querySelector(':scope > [data-kimai-sidebar-toggle]');

        if (toggle === null) {
            return;
        }

        this.#setOpen(toggle, menu, true, this.#getStorageKeys(item));
    }

    /**
     * @param {MouseEvent} event
     * @returns {HTMLAnchorElement|null}
     */
    #resolveNavigationLink(event) {
        const link = event.target.closest('a[href]');

        if (!(link instanceof HTMLAnchorElement)) {
            return null;
        }

        if (link.hasAttribute('data-kimai-sidebar-toggle')) {
            return null;
        }

        if (link.classList.contains('disabled')
            || link.classList.contains('modal-ajax-form')
            || link.classList.contains('remote-modal-load')
            || link.classList.contains('api-link')
            || link.classList.contains('dropdown-toggle')
            || link.dataset.bsToggle === 'dropdown'
        ) {
            return null;
        }

        return link;
    }

    /**
     * @param {HTMLElement} item
     * @returns {{collapsed: string, expanded: string}}
     */
    #getStorageKeys(item) {
        return {
            collapsed: 'kimai_menu_collapsed_' + item.id,
            expanded: 'kimai_menu_expanded_' + item.id,
        };
    }

    /**
     * @param {HTMLElement} toggle
     * @param {HTMLElement} menu
     * @param {boolean} open
     * @param {{collapsed: string, expanded: string}} storageKeys
     */
    #setOpen(toggle, menu, open, storageKeys) {
        const currentlyOpen = menu.classList.contains('show');

        if (currentlyOpen === open) {
            return;
        }

        toggle.classList.toggle('show', open);
        menu.classList.toggle('show', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');

        if (open) {
            sessionStorage.setItem(storageKeys.expanded, '1');
            sessionStorage.removeItem(storageKeys.collapsed);
        } else {
            sessionStorage.removeItem(storageKeys.expanded);
        }
    }
}
