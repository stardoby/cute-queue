import * as t from "io-ts";

import { QUESTION_TYPES } from "../constants";

const base = {
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

}

export const StudentRequestBody = t.type({
    // Specified in headers or URL parameters
    courseId: t.string,
    requestId: t.string,
    creatorId: t.string,

    // Specified in the request body itself
    ...base,
});

export const PartialStudentRequestBody = t.partial({
    resolution: t.string,

    helperId: t.string,
    helperName: t.string,
    ...base
});

export type StudentRequestBodyT = t.TypeOf<typeof StudentRequestBody>;
export type PartialStudentRequestBodyT = t.TypeOf<typeof PartialStudentRequestBody>;
