import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import parseISO from "date-fns/parseISO";

export function nowIsBetween(before: string, after: string) {
    return isAfter(new Date(), parseISO(before)) && isBefore(new Date(), parseISO(after)) 
} 