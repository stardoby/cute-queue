import format from "date-fns/format"
import parse from "date-fns/parse";

import { nowIsBetween } from "@/utils/nowIsBetween";

import type { Schedule } from "@/types/schedule"

/**
 * Determine if the queue is servicing requests based on the schedule. 
 * @param schedule The list of Occurrences that the Queue will be open
 * @returns bool indicating if the Queue is open *right now*
 */
export function scheduleIsOpen(schedule: Schedule) {
    const today = format(new Date(), "EEEE").toUpperCase();
    return schedule.filter(c => c.dayOfWeek === today)
                   .filter(c => {
                        const openingTime = parse(c.opensAt, "h:mm a", new Date());
                        const closingTime = parse(c.closesAt, "h:mm a", new Date());
                        return nowIsBetween(openingTime, closingTime)
                    }).length > 0;
}
