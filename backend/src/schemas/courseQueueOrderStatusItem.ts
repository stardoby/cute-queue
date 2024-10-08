import * as t from "io-ts";
import { REQUEST_STATUSES } from "../constants";

export const CourseQueueOrderStatusItem = t.record(t.string, t.keyof(REQUEST_STATUSES));

export type CourseQueueOrderStatusItemT = t.TypeOf<typeof CourseQueueOrderStatusItem>;