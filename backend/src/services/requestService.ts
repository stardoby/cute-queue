import { GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

import dbClient from "../db/client";
import { assertEnvExists } from "../utils/assertsEnvExists";
import { StudentRequestBody, PartialStudentRequestBody } from "../schemas/studentRequestBody";
import { StudentRequestItem } from "../schemas/studentRequestItem";
import { CourseQueueOrderStatusItem } from "../schemas/courseQueueOrderStatusItem";
import { StatusUpdateBody } from "../schemas/statusUpdateBody";
import { InternalValidationError } from "../errors/InternalValidationError";
import { ExternalValidationError } from "../errors/ExternalValidationError";
import { REQUEST_STATUS } from "../constants";

import type { StudentRequestBodyT, PartialStudentRequestBodyT } from "../schemas/studentRequestBody";
import type { StudentRequestItemT } from "../schemas/studentRequestItem";
import { NotFoundError } from "../errors/NotFoundError";

export function validateStudentRequest(req: unknown): StudentRequestBodyT {
    const decoded = StudentRequestBody.decode(req);

    if (isLeft(decoded)) {
        throw new ExternalValidationError(PathReporter.report(decoded).join(";"));
    }

    return decoded.right;
}

export function validateStatusUpdate(req: unknown): REQUEST_STATUS | null {
    const decoded = StatusUpdateBody.decode(req);

    if (isLeft(decoded)) return null;

    return decoded.right.nextStatus;
} 

export function validatePartialStudentRequest(req: unknown): PartialStudentRequestBodyT {
    const decoded = PartialStudentRequestBody.decode(req);
    if (isLeft(decoded)) {
        throw new ExternalValidationError(PathReporter.report(decoded).join(";"));
    }
    return decoded.right;
}

export async function putStudentRequest(req: StudentRequestBodyT): Promise<void> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const now = new Date().toISOString();
    const input = new UpdateCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId: req.courseId,
            subKey: `request:${req.requestId}`,
        },
        UpdateExpression: `
            set requestId = :requestId,
                creatorId = :creatorId,
                createdAt = if_not_exists(createdAt, :now),
                updatedAt = :now,
                creatorName = :creatorName,
                #location = :location,
                assignment = :assignment,
                shortDescription = :shortDescription,
                problem = :problem,
                questionType = :questionType,
                alreadyTried = :alreadyTried,
                bestGuess = :bestGuess,
                howToHelp = :howToHelp,
                stuckTime = :stuckTime
        `,
        ExpressionAttributeNames: {
            "#location": "location",
        },
        ExpressionAttributeValues: {
            ":requestId": req.requestId,
            ":creatorId": req.creatorId,
            ":now": now,
            ":creatorName": req.creatorName,
            ":location": req.location,
            ":assignment": req.assignment,
            ":shortDescription": req.shortDescription,
            ":problem": req.problem,
            ":questionType": req.questionType,
            ":alreadyTried": req.alreadyTried,
            ":bestGuess": req.bestGuess,
            ":howToHelp": req.howToHelp,
            ":stuckTime": req.stuckTime
        }
    })

    
    await dbClient.send(input);
}

export async function getRequestById(courseId: string, requestId: string): Promise<StudentRequestItemT | null> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new GetCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: `request:${requestId}`,
        }
    });

    const response = await dbClient.send(input);
    if (!response.Item) return null;

    const decoded = StudentRequestItem.decode(response.Item);
    if (isLeft(decoded)) {
        throw new InternalValidationError(PathReporter.report(decoded).join(";"));
    }

    return decoded.right;
}

export async function getAllRequestsForUser(userId: string, courseId: string): Promise<StudentRequestItemT[]> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new QueryCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        KeyConditionExpression: "courseId = :courseId and begins_with(subKey, :subKey)",
        FilterExpression: "creatorId = :userId",
        ExpressionAttributeValues: {
            ":courseId": courseId,
            ":subKey": "request:",
            ":userId": userId,
        },
    });

    const response = await dbClient.send(input);
    const items = response.Items ?? [];

    return items.map(x => {
        const decoded = StudentRequestItem.decode(x);
        if (isLeft(decoded)) {
            throw new InternalValidationError(PathReporter.report(decoded).join(";"));
        }

        return decoded.right;
    });
}

export async function getActiveRequestIdForUser(userId: string, courseId: string): Promise<{ requestId: string, status: REQUEST_STATUS} | null> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new QueryCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        IndexName: "userRequests",
        KeyConditionExpression: "creatorId = :creatorId and courseId = :courseId",
        ExpressionAttributeValues: {
            ":creatorId": userId,
            ":courseId": courseId,
        },
    });

    const statusInput = new GetCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: "requestStatus"
        },
    });

    const [ allRequestsOutput, statusesOutput ] = await Promise.all([
        dbClient.send(input),
        dbClient.send(statusInput)
    ]);

    // Fail fast: if the user has no requests in the queue, there's no need to lookup the status
    if (!allRequestsOutput.Items || allRequestsOutput.Items.length <= 0) return null;

    // Parse the database response of request statuses
    delete statusesOutput.Item?.subKey;
    delete statusesOutput.Item?.courseId;
    const decoded = CourseQueueOrderStatusItem.decode(statusesOutput.Item);
    if (isLeft(decoded)) {
        throw new InternalValidationError();
    }
    const statuses = decoded.right;

    // Parse each request that the user has in the queue, filtering for ones that are not closed
    const requests = allRequestsOutput.Items.map(x => {
        const decoded = StudentRequestItem.decode(x);
        if (isLeft(decoded)) {
            throw new InternalValidationError();
        };

        return decoded.right;
    }).filter(x => x.requestId in statuses);

    // If there isn't a request that isn't closed, return null
    if (requests.length == 0) return null;
    return { requestId: requests[0].requestId, status: statuses[requests[0].requestId] };
};

export async function addCommentToRequest(courseId: string, requestId: string, comment: string) {
    assertEnvExists(process.env.COURSES_TABLE_NAME);
    const input = new UpdateCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: `request:${requestId}`
        },
        UpdateExpression: `SET comments = list_append(if_not_exists(comments, :empty), :comment)`,
        ConditionExpression: `attribute_exists(courseId)`, // only update if an item exists
        ExpressionAttributeValues:{
            ':comment': [{
                text: comment,
                createdAt: new Date().toISOString()
            }],
            ':empty': [],
        }
    });

    try {
        await dbClient.send(input);
    } catch (e: unknown) {
        if (e instanceof ConditionalCheckFailedException) {
            throw new NotFoundError("Attempt to add comment to non-existent request");
        }
        throw e;
    }
};

export async function partialRequestUpdate(courseId: string, requestId: string, req: PartialStudentRequestBodyT) {
    assertEnvExists(process.env.COURSES_TABLE_NAME);
    const expr = Object.entries(req)
        .filter(([_, val]) => typeof val !== "undefined" )
        .reduce<{ names: Record<string, string>, values: Record<string, string | string[]>, updates: string[]}>((acc, [key, val]) => {
            acc.names[`#${key}`] = key;
            acc.values[`:${key}`] = val;
            acc.updates.push(`#${key} = :${key}`);
            return acc;
        }, { names: {}, values: {}, updates: [] });

    const input = new UpdateCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: `request:${requestId}`,
        },
        UpdateExpression: `SET ${expr.updates.join(", ")}`,
        ConditionExpression: `attribute_exists(courseId)`,
        ExpressionAttributeNames: expr.names,
        ExpressionAttributeValues: expr.values,
    });

    try {
        await dbClient.send(input);
    } catch (e: unknown) {
        if (e instanceof ConditionalCheckFailedException) {
            throw new NotFoundError("Attempt to add comment to non-existent request");
        }
        throw e;
    }
}
