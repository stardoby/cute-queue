import format from "date-fns/format";

export function formatDateAsTime(date: string) {
    return format(new Date(date), "h:mm a");
}
