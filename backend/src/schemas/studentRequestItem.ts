import * as t from "io-ts";

import { QUESTION_TYPES } from "../constants";

export const StudentRequestItem = t.type({
    requestId: t.string,
    courseId: t.string,
    subKey: t.string,
    creatorId: t.string,

    updatedAt: t.string,
    createdAt: t.string,
    
    creatorName: t.string,
    location: t.string,
    assignment: t.string,
    problem: t.string,
    shortDescription: t.string,
    questionType: t.keyof(QUESTION_TYPES),
    alreadyTried: t.array(t.string),
    bestGuess: t.string,
    howToHelp: t.string,
    stuckTime: t.string,

    resolution: t.union([t.undefined, t.string]),

    helperId: t.union([t.undefined, t.string]),
    helperName: t.union([t.undefined, t.string]),

    comments: t.union([t.undefined, t.array(t.type({
        createdAt: t.string,
        text: t.string,
    }))]),
});

export type StudentRequestItemT = t.TypeOf<typeof StudentRequestItem>;
