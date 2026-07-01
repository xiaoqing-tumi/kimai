/*
 * This file is part of the Kimai time-tracking app.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import KimaiPlugin from '../KimaiPlugin';

const SHIFT_A = {begin: '09:00', end: '18:00', break: '1:00', duration: '8:00'};
const SHIFT_B = {begin: '09:30', end: '18:30', break: '1:00', duration: '8:00'};

export default class KimaiShiftTimesheet extends KimaiPlugin {

    getId()
    {
        return 'shift-timesheet';
    }

    init()
    {
        document.addEventListener('click', (event) => {
            const button = event.target.closest('.apply-shift-day');
            if (button === null) {
                return;
            }

            event.preventDefault();
            const shift = button.dataset.shift === 'B' ? SHIFT_B : SHIFT_A;
            const prefix = button.dataset.formPrefix;
            this.#applyShift(prefix, shift);
        });

        document.addEventListener('kimai.reloadPage', () => {
            // buttons are rebound via document delegation
        });
    }

    /**
     * @param {string} prefix
     * @param {{begin: string, end: string, break: string, duration: string}} shift
     */
    #applyShift(prefix, shift)
    {
        this.#setFieldValue(prefix + '_begin_time', shift.begin);
        this.#setFieldValue(prefix + '_duration', shift.duration);

        const breakField = document.getElementById(prefix + '_break');
        if (breakField !== null) {
            breakField.value = shift.break;
        }

        // End must include lunch break (net 8h + 1h break). Do not dispatch duration change:
        // KimaiTimesheetForm recalculates end as begin + duration only.
        this.#setFieldValue(prefix + '_end_time', shift.end);
    }

    /**
     * @param {string} id
     * @param {string} value
     */
    #setFieldValue(id, value)
    {
        const field = document.getElementById(id);
        if (field !== null) {
            field.value = value;
        }
    }
}
