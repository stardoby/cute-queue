import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";

/**
 * Returns true if before < now < after
 * 
 * @param before Date lower bound
 * @param after Date upper bound
 * @returns before < now < after 
 */
export function nowIsBetween(before: Date, after: Date) {
    return isAfter(new Date(), before) && isBefore(new Date(), after) 
} 
