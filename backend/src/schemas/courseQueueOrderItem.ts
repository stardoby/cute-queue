import * as t from "io-ts";

export const CourseQueueOrderItem = t.type({
    order: t.array(t.string),
});

export type CourseQueueOrderItemT = t.TypeOf<typeof CourseQueueOrderItem>;
