export type Schedule = Occurrence[];

export interface Occurrence {
    dayOfWeek: string;
    opensAt: string;
    closesAt: string;
}
