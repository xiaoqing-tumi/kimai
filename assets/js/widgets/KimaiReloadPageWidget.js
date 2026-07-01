/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/*!
 * [KIMAI] KimaiReloadPageWidget: a simple helper to reload the page on events
 */

import KimaiPageLoader from './KimaiPageLoader';

export default class KimaiReloadPageWidget {

    static #abortController = null;

    constructor(events, fullReload, signal) {
        const reloadPage = () => {
            KimaiPageLoader.invalidateCache(document.location.href);

            if (fullReload) {
                document.location.reload();
            } else {
                KimaiPageLoader.load(document.location.href, false);
            }
        };

        for (const eventName of events.split(' ')) {
            if (eventName === '') {
                continue;
            }

            document.addEventListener(eventName, reloadPage, {signal});
        }
    }

    static create(events, fullReload) {
        if (fullReload === undefined || fullReload === null) {
            fullReload = false;
        }

        if (KimaiReloadPageWidget.#abortController !== null) {
            KimaiReloadPageWidget.#abortController.abort();
        }

        KimaiReloadPageWidget.#abortController = new AbortController();

        return new KimaiReloadPageWidget(events, fullReload, KimaiReloadPageWidget.#abortController.signal);
    }
}
