/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Modal, Tooltip } from 'bootstrap';
import KimaiContextMenu from './KimaiContextMenu';

const EXTRA_BUNDLE_PATTERN = /\/build\/(calendar|chart|dashboard|highlight|invoice|export)/;
const PAGE_CACHE_MAX = 12;

let popstateInitialized = false;
let listenerPatchInstalled = false;
let pageAbortController = null;
let pageListenerSignal = null;
let loadingUrl = null;
let loadGeneration = 0;

export default class KimaiPageLoader {

    /** @type {Map<string, object>} */
    static #pageCache = new Map();
    static #prefetchInFlight = new Set();
    /** @type {Map<string, Promise<object>>} */
    static #fetchInFlight = new Map();
    /** @type {Map<string, Promise<void>>} */
    static #bundleLoadPromises = new Map();

    static initPopState() {
        KimaiPageLoader.#installListenerPatch();

        if (popstateInitialized) {
            return;
        }

        popstateInitialized = true;

        window.addEventListener('popstate', () => {
            if (KimaiPageLoader.requiresFullPageLoad(document.location.href)) {
                document.location.assign(document.location.href);

                return;
            }

            KimaiPageLoader.load(document.location.href, false);
        });
    }

    static #installListenerPatch() {
        if (listenerPatchInstalled) {
            return;
        }

        listenerPatchInstalled = true;

        const nativeAddEventListener = document.addEventListener.bind(document);

        document.addEventListener = function(type, listener, options) {
            if ((type === 'kimai.reloadPage' || type === 'kimai.initialized') && pageListenerSignal !== null) {
                if (typeof options === 'object' && options !== null) {
                    if (options.signal === undefined) {
                        options = Object.assign({}, options, {signal: pageListenerSignal});
                    }
                } else {
                    options = {signal: pageListenerSignal};
                }
            }

            return nativeAddEventListener(type, listener, options);
        };
    }

    /**
     * @param {string} url
     */
    /**
     * @param {string} [url]
     */
    static invalidateCache(url) {
        const absoluteUrl = KimaiPageLoader.#normalizeUrl(url ?? window.location.href);

        if (absoluteUrl !== null) {
            KimaiPageLoader.#pageCache.delete(absoluteUrl);
        }
    }

    /**
     * @param {string} url
     * @returns {boolean}
     */
    static #shouldSkipPrefetch(url) {
        try {
            const pathname = new URL(url, document.baseURI).pathname;

            // CSRF-sensitive pages must not be prefetched in the background
            return pathname.includes('/admin/permissions');
        } catch {
            return false;
        }
    }

    static prefetch(url) {
        const absoluteUrl = KimaiPageLoader.#normalizeUrl(url);

        if (absoluteUrl === null
            || KimaiPageLoader.#shouldSkipPrefetch(absoluteUrl)
            || KimaiPageLoader.#pageCache.has(absoluteUrl)
            || KimaiPageLoader.#prefetchInFlight.has(absoluteUrl)
            || KimaiPageLoader.#fetchInFlight.has(absoluteUrl)
            || absoluteUrl === window.location.href
        ) {
            return;
        }

        KimaiPageLoader.#prefetchInFlight.add(absoluteUrl);

        if (KimaiPageLoader.#isCalendarUrl(absoluteUrl)) {
            KimaiPageLoader.#prefetchDocument(absoluteUrl);
        }

        KimaiPageLoader.#fetchPage(absoluteUrl)
            .catch(() => {})
            .finally(() => {
                KimaiPageLoader.#prefetchInFlight.delete(absoluteUrl);
            });
    }

    /**
     * Heavy pages with dedicated webpack entries must use a full page load.
     *
     * @param {string} url
     * @returns {boolean}
     */
    static requiresFullPageLoad(url) {
        try {
            const pathname = new URL(url, document.baseURI).pathname;

            return pathname.includes('/calendar') || pathname.includes('/dashboard');
        } catch {
            return false;
        }
    }

    /**
     * Prefetch frequently used pages once the UI is idle.
     */
    static scheduleIdlePrefetch() {
        if (typeof window.kimai === 'undefined') {
            return;
        }

        KimaiPageLoader.#warmCalendarBundleFromManifest();

        const urls = [];

        document.querySelectorAll(
            '.navbar-vertical a.navbar-menu-calendar[href], .navbar-vertical a.navbar-menu-timesheet[href]'
        ).forEach((link) => {
            const href = link.getAttribute('href');

            if (href !== null && href !== '' && href !== '#') {
                urls.push(href);
            }
        });

        // Calendar is heavy: prefetch immediately so the first click can use the browser cache.
        urls.forEach((url) => {
            if (KimaiPageLoader.#isCalendarUrl(url)) {
                KimaiPageLoader.prefetch(url);
            }
        });

        const deferredUrls = urls.filter((url) => !KimaiPageLoader.#isCalendarUrl(url));
        const runDeferred = () => {
            KimaiPageLoader.prefetchAll(deferredUrls);
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(runDeferred, {timeout: 1500});
        } else {
            window.setTimeout(runDeferred, 800);
        }
    }

    /**
     * @param {string[]} urls
     */
    static prefetchAll(urls) {
        urls.forEach((url, index) => {
            window.setTimeout(() => {
                KimaiPageLoader.prefetch(url);
            }, index * 80);
        });
    }

    /**
     * @param {string} url
     * @returns {string|null}
     */
    static #normalizeUrl(url) {
        try {
            const absoluteUrl = new URL(url, document.baseURI);

            if (absoluteUrl.origin !== window.location.origin) {
                return null;
            }

            return absoluteUrl.href;
        } catch {
            return null;
        }
    }

    /**
     * @param {string} url
     * @param {string} html
     */
    static #storePageCache(url, html) {
        const entry = KimaiPageLoader.#parseToCacheEntry(html);

        if (entry === null) {
            return;
        }

        if (KimaiPageLoader.#pageCache.size >= PAGE_CACHE_MAX) {
            const oldestKey = KimaiPageLoader.#pageCache.keys().next().value;
            KimaiPageLoader.#pageCache.delete(oldestKey);
        }

        KimaiPageLoader.#pageCache.set(url, entry);
        KimaiPageLoader.#preloadBundles(entry);
    }

    /**
     * @param {string} url
     * @returns {Promise<object>}
     */
    static #fetchPage(url) {
        const cachedEntry = KimaiPageLoader.#pageCache.get(url);

        if (cachedEntry !== undefined) {
            return Promise.resolve(cachedEntry);
        }

        const inFlight = KimaiPageLoader.#fetchInFlight.get(url);

        if (inFlight !== undefined) {
            return inFlight;
        }

        const promise = window.kimai.getPlugin('fetch').fetch(url)
            .then(response => response.text())
            .then((html) => {
                KimaiPageLoader.#storePageCache(url, html);
                const entry = KimaiPageLoader.#pageCache.get(url);

                if (entry === undefined) {
                    throw new Error('Page cache entry missing');
                }

                return entry;
            })
            .finally(() => {
                KimaiPageLoader.#fetchInFlight.delete(url);
            });

        KimaiPageLoader.#fetchInFlight.set(url, promise);

        return promise;
    }

    /**
     * @param {object} entry
     */
    static #preloadBundles(entry) {
        entry.bundleScripts.forEach((src) => {
            KimaiPageLoader.#ensureScriptLoaded(src);
        });

        entry.bundleStyles.forEach((href) => {
            KimaiPageLoader.#ensureStylesheetLoaded(href);
        });
    }

    /**
     * Start loading the calendar webpack entry in the background.
     */
    static #warmCalendarBundleFromManifest() {
        if (document.querySelector('.navbar-vertical a.navbar-menu-calendar[href]') === null) {
            return;
        }

        if (typeof KimaiCalendar !== 'undefined') {
            return;
        }

        fetch('/build/entrypoints.json', {credentials: 'same-origin'})
            .then((response) => response.json())
            .then((data) => {
                const scripts = data.entrypoints?.calendar?.js ?? [];

                scripts.forEach((src) => {
                    if (src.includes('runtime') && document.querySelector('script[src*="runtime"]') !== null) {
                        return;
                    }

                    KimaiPageLoader.#ensureScriptLoaded(src);
                });

                const styles = data.entrypoints?.calendar?.css ?? [];

                styles.forEach((href) => {
                    KimaiPageLoader.#ensureStylesheetLoaded(href);
                });
            })
            .catch(() => {});
    }

    /**
     * @param {string} url
     */
    static #prefetchDocument(url) {
        if (document.querySelector('link[rel="prefetch"][href="' + url + '"]') !== null) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    /**
     * @param {string} url
     * @returns {boolean}
     */
    static #isCalendarUrl(url) {
        try {
            return new URL(url, document.baseURI).pathname.includes('/calendar');
        } catch {
            return false;
        }
    }

    static #showCalendarPlaceholder() {
        const content = document.querySelector('section.content');

        if (content === null) {
            return;
        }

        content.innerHTML = ''
            + '<div class="row">'
            + '<div class="col-xs-12 col-12">'
            + '<div class="card">'
            + '<div class="card-body p-0">'
            + KimaiPageLoader.#getCalendarPlaceholderHtml()
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';
    }

    /**
     * @returns {string}
     */
    static #getCalendarPlaceholderHtml() {
        const cells = Array.from({length: 35}, () => '<div class="kimai-calendar-skeleton-cell"></div>').join('');

        return ''
            + '<div class="kimai-calendar-placeholder" aria-hidden="true">'
            + '<div class="kimai-calendar-skeleton-toolbar">'
            + '<span class="kimai-calendar-skeleton-pill kimai-calendar-skeleton-pill-lg"></span>'
            + '<span class="kimai-calendar-skeleton-pill"></span>'
            + '<span class="kimai-calendar-skeleton-pill"></span>'
            + '<span class="kimai-calendar-skeleton-pill"></span>'
            + '</div>'
            + '<div class="kimai-calendar-skeleton-grid">' + cells + '</div>'
            + '</div>';
    }

    /**
     * @param {string} url
     */
    static #touchPageCache(url) {
        const entry = KimaiPageLoader.#pageCache.get(url);

        if (entry === undefined) {
            return;
        }

        KimaiPageLoader.#pageCache.delete(url);
        KimaiPageLoader.#pageCache.set(url, entry);
    }

    /**
     * @param {string} html
     * @returns {object|null}
     */
    static #parseToCacheEntry(html) {
        const doc = KimaiPageLoader.#parseHtml(html);
        const content = doc.querySelector('section.content');

        if (content === null) {
            return null;
        }

        const header = doc.querySelector('.page-header');
        const modalHost = doc.querySelector('div.page-wrapper div.hidden-no-space');
        const scripts = [];

        doc.querySelectorAll('script:not([src])').forEach((script) => {
            const content = script.textContent.trim();

            if (content === '' || content.includes('KimaiWebLoader')) {
                return;
            }

            scripts.push(content.replace(/kimai\.initialized/g, 'kimai.reloadPage'));
        });

        return {
            contentHtml: content.outerHTML,
            headerHtml: header !== null ? header.outerHTML : null,
            modalsHtml: modalHost !== null ? modalHost.innerHTML : '',
            title: doc.querySelector('title')?.textContent ?? null,
            dataTitle: doc.body.getAttribute('data-title'),
            pageTitles: [...doc.querySelectorAll('.page-title')].map((element) => element.textContent),
            menuItems: KimaiPageLoader.#extractMenuItems(doc),
            menuLinks: KimaiPageLoader.#extractMenuLinks(doc),
            bundleScripts: KimaiPageLoader.#extractBundleScripts(doc),
            bundleStyles: KimaiPageLoader.#extractBundleStyles(doc),
            scripts: scripts,
        };
    }

    /**
     * @param {Document} doc
     * @returns {Array<{id: string, className: string, defaultOpen: string|null}>}
     */
    static #extractMenuItems(doc) {
        const menu = doc.querySelector('.navbar-vertical #navbar-menu .navbar-nav');

        if (menu === null) {
            return [];
        }

        const items = [];

        menu.querySelectorAll('.nav-item[id]').forEach((item) => {
            const menuPanel = item.querySelector(':scope > .dropdown-menu');

            items.push({
                id: item.id,
                className: item.className,
                defaultOpen: menuPanel?.dataset.defaultOpen ?? null,
            });
        });

        return items;
    }

    /**
     * @param {Document} doc
     * @returns {Array<{className: string, active: boolean}>}
     */
    static #extractMenuLinks(doc) {
        const menu = doc.querySelector('.navbar-vertical #navbar-menu .navbar-nav');

        if (menu === null) {
            return [];
        }

        const links = [];

        menu.querySelectorAll('[class*="navbar-menu-"]').forEach((link) => {
            const menuClass = Array.from(link.classList).find((className) => className.startsWith('navbar-menu-'));

            if (menuClass === undefined) {
                return;
            }

            links.push({
                className: menuClass,
                active: link.classList.contains('active'),
            });
        });

        return links;
    }

    /**
     * @param {Document} doc
     * @returns {string[]}
     */
    static #extractBundleScripts(doc) {
        const scripts = [];

        doc.querySelectorAll('script[src]').forEach((script) => {
            const src = script.getAttribute('src');

            if (src !== null && EXTRA_BUNDLE_PATTERN.test(src)) {
                scripts.push(src);
            }
        });

        return scripts;
    }

    /**
     * @param {Document} doc
     * @returns {string[]}
     */
    static #extractBundleStyles(doc) {
        const styles = [];

        doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            const href = link.getAttribute('href');

            if (href !== null && EXTRA_BUNDLE_PATTERN.test(href)) {
                styles.push(href);
            }
        });

        return styles;
    }

    /**
     * @param {string} url
     */
    static navigate(url) {
        KimaiPageLoader.load(url, true);
    }

    static #showNavigationProgress() {
        document.dispatchEvent(new CustomEvent('kimai.reloadContent', {
            detail: {
                container: 'div.page-body',
                local: true,
            },
        }));
    }

    /**
     * @param {string} url
     * @param {boolean} pushState
     */
    static load(url, pushState = true) {
        const absoluteUrl = KimaiPageLoader.#normalizeUrl(url);

        if (absoluteUrl === null) {
            document.location = url;

            return;
        }

        if (KimaiPageLoader.requiresFullPageLoad(absoluteUrl)) {
            document.location.assign(absoluteUrl);

            return;
        }

        const cachedEntry = KimaiPageLoader.#pageCache.get(absoluteUrl);

        if (cachedEntry !== undefined) {
            if (loadingUrl !== null && loadingUrl !== absoluteUrl) {
                KimaiPageLoader.#cancelLoadRequest();
            }

            KimaiPageLoader.#touchPageCache(absoluteUrl);
            KimaiPageLoader.#applyCacheEntry(cachedEntry, absoluteUrl, pushState);

            return;
        }

        if (loadingUrl === absoluteUrl && loadingUrl !== null) {
            return;
        }

        if (loadingUrl !== null && loadingUrl !== absoluteUrl) {
            KimaiPageLoader.#cancelLoadRequest();
        }

        KimaiPageLoader.#beginNavigating();
        KimaiPageLoader.#showNavigationProgress();
        const generation = ++loadGeneration;
        loadingUrl = absoluteUrl;

        KimaiPageLoader.#fetchPage(absoluteUrl)
            .then((entry) => {
                if (generation !== loadGeneration) {
                    return;
                }

                KimaiPageLoader.#touchPageCache(absoluteUrl);
                KimaiPageLoader.#applyCacheEntry(entry, absoluteUrl, pushState);
            })
            .catch((error) => {
                if (KimaiPageLoader.#isAbortError(error)) {
                    return;
                }

                KimaiPageLoader.#endNavigating();
                document.location = absoluteUrl;
            })
            .finally(() => {
                if (loadingUrl === absoluteUrl) {
                    loadingUrl = null;
                }
            });
    }

    static #cancelLoadRequest() {
        loadGeneration++;
        loadingUrl = null;
        KimaiPageLoader.#endNavigating();
    }

    /**
     * @param {*} error
     * @returns {boolean}
     */
    static #isAbortError(error) {
        return error !== null
            && typeof error === 'object'
            && (error.name === 'AbortError' || error.code === 20);
    }

    /**
     * @param {object} entry
     * @param {string} url
     * @param {boolean} pushState
     */
    static #applyCacheEntry(entry, url, pushState) {
        KimaiPageLoader.#loadBundles(entry)
            .then(() => {
                KimaiPageLoader.#applyEntry(entry);

                if (pushState) {
                    history.pushState({kimaiPage: true}, '', url);
                }

                document.dispatchEvent(new CustomEvent('kimai.reloadPage', {
                    detail: {kimai: window.kimai},
                }));

                KimaiPageLoader.#endNavigating();
            })
            .catch(() => {
                KimaiPageLoader.#endNavigating();
                document.location = url;
            });
    }

    /**
     * @param {object} entry
     * @returns {Promise<void>}
     */
    static #loadBundles(entry) {
        const loaders = [
            ...entry.bundleScripts.map((src) => KimaiPageLoader.#ensureScriptLoaded(src)),
            ...entry.bundleStyles.map((href) => KimaiPageLoader.#ensureStylesheetLoaded(href)),
        ];

        return Promise.all(loaders);
    }

    /**
     * @param {string} src
     * @returns {Promise<void>}
     */
    static #ensureScriptLoaded(src) {
        if (document.querySelector('script[src="' + src + '"]') !== null) {
            return Promise.resolve();
        }

        const existing = KimaiPageLoader.#bundleLoadPromises.get(src);

        if (existing !== undefined) {
            return existing;
        }

        const promise = KimaiPageLoader.#loadScript(src);
        KimaiPageLoader.#bundleLoadPromises.set(src, promise);

        return promise;
    }

    /**
     * @param {string} href
     * @returns {Promise<void>}
     */
    static #ensureStylesheetLoaded(href) {
        if (document.querySelector('link[href="' + href + '"]') !== null) {
            return Promise.resolve();
        }

        const existing = KimaiPageLoader.#bundleLoadPromises.get(href);

        if (existing !== undefined) {
            return existing;
        }

        const promise = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error('Failed loading ' + href));
            document.head.appendChild(link);
        });
        KimaiPageLoader.#bundleLoadPromises.set(href, promise);

        return promise;
    }

    /**
     * @param {object} entry
     */
    static #applyEntry(entry) {
        const kimai = window.kimai;
        const pageBody = document.querySelector('div.page-body');
        const wrapper = document.querySelector('div.page-wrapper');

        pageBody?.classList.add('kimai-page-initializing');

        if (wrapper !== null) {
            kimai.getPlugin('form').destroyForm('div.page-wrapper form');
            wrapper.querySelectorAll('[data-toggle="tooltip"]').forEach((element) => {
                Tooltip.getInstance(element)?.dispose();
            });
        }

        const oldContent = document.querySelector('section.content');

        if (oldContent !== null) {
            oldContent.outerHTML = entry.contentHtml;
        }

        KimaiPageLoader.#replacePageHeader(entry.headerHtml);
        KimaiPageLoader.#syncModalsFromEntry(entry);
        KimaiPageLoader.#updateTitlesFromEntry(entry);
        KimaiPageLoader.#syncSidebarMenuFromEntry(entry);
        KimaiPageLoader.#executeScripts(entry.scripts);
    }

    /**
     * @param {object} entry
     */
    static #syncModalsFromEntry(entry) {
        const modalHost = document.querySelector('div.page-wrapper div.hidden-no-space');

        if (modalHost === null) {
            return;
        }

        modalHost.querySelectorAll('.modal').forEach((modal) => {
            const instance = Modal.getInstance(modal);

            if (instance !== null) {
                instance.dispose();
            }
        });

        modalHost.innerHTML = entry.modalsHtml ?? '';
    }

    /**
     * @param {string|null} headerHtml
     */
    static #replacePageHeader(headerHtml) {
        const oldHeader = document.querySelector('.page-header');
        const pageBody = document.querySelector('.page-body');

        if (headerHtml !== null && oldHeader !== null) {
            oldHeader.outerHTML = headerHtml;

            return;
        }

        if (headerHtml !== null && oldHeader === null && pageBody !== null) {
            pageBody.insertAdjacentHTML('beforebegin', headerHtml);

            return;
        }

        if (headerHtml === null && oldHeader !== null) {
            oldHeader.remove();
        }
    }

    /**
     * @param {object} entry
     */
    static #updateTitlesFromEntry(entry) {
        if (entry.title !== null) {
            document.title = entry.title;
        }

        if (entry.dataTitle !== null) {
            document.body.setAttribute('data-title', entry.dataTitle);
        }

        const currentTitles = document.querySelectorAll('.page-title');

        entry.pageTitles.forEach((title, index) => {
            if (currentTitles[index] !== undefined) {
                currentTitles[index].textContent = title;
            }
        });
    }

    /**
     * @param {object} entry
     */
    static #syncSidebarMenuFromEntry(entry) {
        const targetMenu = document.querySelector('.navbar-vertical #navbar-menu .navbar-nav');

        if (targetMenu === null) {
            return;
        }

        entry.menuItems.forEach((item) => {
            const targetItem = targetMenu.querySelector('#' + CSS.escape(item.id));

            if (targetItem === null) {
                return;
            }

            targetItem.className = item.className;

            const targetMenuPanel = targetItem.querySelector(':scope > .dropdown-menu');

            if (targetMenuPanel !== null && item.defaultOpen !== null) {
                targetMenuPanel.dataset.defaultOpen = item.defaultOpen;
            }
        });

        entry.menuLinks.forEach((link) => {
            const targetLink = targetMenu.querySelector('.' + link.className);

            if (targetLink === null) {
                return;
            }

            targetLink.classList.toggle('active', link.active);
        });

        document.dispatchEvent(new CustomEvent('kimai.sidebarMenuSync'));
    }

    /**
     * @param {string[]} scripts
     */
    static #executeScripts(scripts) {
        if (scripts.length === 0) {
            return;
        }

        if (pageAbortController !== null) {
            pageAbortController.abort();
        }

        pageAbortController = new AbortController();
        pageListenerSignal = pageAbortController.signal;

        const newScript = document.createElement('script');
        newScript.textContent = scripts.join('\n');
        document.body.appendChild(newScript);
        newScript.remove();
    }

    /**
     * @param {string} html
     * @returns {Document}
     */
    static #parseHtml(html) {
        const parser = new DOMParser();

        return parser.parseFromString(html, 'text/html');
    }

    /**
     * @param {string} src
     * @returns {Promise<void>}
     */
    static #loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed loading ' + src));
            document.head.appendChild(script);
        });
    }

    static #beginNavigating() {
        document.querySelector('div.page-body')?.classList.add('is-navigating');
    }

    static #endNavigating() {
        document.querySelectorAll('.page-body.is-navigating').forEach((element) => {
            element.classList.remove('is-navigating');
        });

        document.dispatchEvent(new Event('kimai.reloadedContent'));

        // Safety net: never leave the page hidden if reinitialize was skipped
        requestAnimationFrame(() => {
            document.querySelector('div.page-body')?.classList.remove('kimai-page-initializing');
        });
    }

    /**
     * Re-initialize UI plugins after partial page load.
     */
    static reinitialize() {
        const kimai = window.kimai;
        const wrapper = document.querySelector('div.page-wrapper');

        if (wrapper === null) {
            document.querySelector('div.page-body')?.classList.remove('kimai-page-initializing');

            return;
        }

        kimai.getPlugin('form').activateForm('div.page-wrapper form');

        const columnView = kimai.getPlugin('datatable-column-visibility');

        if (columnView !== undefined && typeof columnView.activate === 'function') {
            columnView.activate();
        }

        wrapper.querySelectorAll('[data-toggle="tooltip"]').forEach((element) => {
            if (Tooltip.getInstance(element) === null) {
                new Tooltip(element);
            }
        });

        KimaiPageLoader.#finishPageInitialization(wrapper);
    }

    /**
     * @param {Element} wrapper
     */
    static #finishPageInitialization(wrapper) {
        requestAnimationFrame(() => {
            document.querySelector('div.page-body')?.classList.remove('kimai-page-initializing');

            const autofocusEl = wrapper.querySelector('[autofocus]');

            if (autofocusEl instanceof HTMLElement) {
                autofocusEl.focus({preventScroll: true});
            }
        });
    }
}
