import * as t from "io-ts";
import { ROLES } from "../constants";

export const UserMembershipItem = t.type({
    role: t.keyof(ROLES),
    courseId: t.string,
    memberId: t.string,
    subKey: t.string, 
});

export type UserMembershipItemT = t.TypeOf<typeof UserMembershipItem>;
