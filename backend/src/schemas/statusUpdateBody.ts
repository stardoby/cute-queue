import * as t from "io-ts";
import { REQUEST_STATUSES } from "../constants";

export const StatusUpdateBody = t.type({
    nextStatus: t.keyof(REQUEST_STATUSES)
});

export type StatusUpdateBodyT = t.TypeOf<typeof StatusUpdateBody>;
