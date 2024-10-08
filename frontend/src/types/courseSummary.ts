import type { Schedule } from "./schedule";

export interface CourseSummary {
    role: string;
    courseId: string;
    schedule: Schedule;
    name: string;
}
