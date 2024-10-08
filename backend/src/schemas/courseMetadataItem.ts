import * as t from "io-ts";
import { DAYS_OF_WEEK } from "../constants";

export const CourseMetadataItem = t.type({
    name: t.string,
    schedule: t.array(t.type({
        dayOfWeek: t.keyof(DAYS_OF_WEEK),
        opensAt: t.string,
        closesAt: t.string,
    })),
    location: t.string,
    resources: t.array(t.type({
        text: t.string,
        url: t.string
    })),
    courseId: t.string,
});

export type CourseMetadataItemT = t.TypeOf<typeof CourseMetadataItem>;
