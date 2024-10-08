import { BatchGetCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { isLeft } from "fp-ts/lib/Either";

import dbClient from "../db/client";
import { CourseMetadataItem } from "../schemas/courseMetadataItem";
import { CourseQueueOrderItem } from "../schemas/courseQueueOrderItem";
import { CourseQueueOrderStatusItem } from "../schemas/courseQueueOrderStatusItem";
import { InternalValidationError } from "../errors/InternalValidationError";
import { assertEnvExists } from "../utils/assertsEnvExists";
import { REQUEST_STATUSES } from "../constants";

import type { CourseMetadataItemT } from "../schemas/courseMetadataItem";
import type { CourseQueueOrderItemT } from "../schemas/courseQueueOrderItem";
import type { REQUEST_STATUS } from "../constants";

/**
 * Returns metadata for a grouping of courses 
 * @param courseIds a list of course ids to fetch metadata for
 * @returns A list of each course's metadata item
 */
export async function getCoursesMetadataById(courseIds: string[]): Promise<CourseMetadataItemT[]> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);
    if (courseIds.length < 1) return [];

    // Build key expression for every courseId
    const requestItems = courseIds.map((courseId) => ({
        "courseId": courseId,
        "subKey": "metadata",
    }));

    // Fire dynamo batch query
    const input = new BatchGetCommand({
        RequestItems: {
            [process.env.COURSES_TABLE_NAME]: {
                Keys: requestItems,
            }
        }
    });
    const responses = (await dbClient.send(input)).Responses?.[process.env.COURSES_TABLE_NAME] ?? [];

    // Validate responses
    return responses.map((x: unknown) => {
        const decoded = CourseMetadataItem.decode(x);
        if (isLeft(decoded)) {
            throw new InternalValidationError();
        }
        return decoded.right;
    });
}

export async function getCourseMetadataById(courseId: string): Promise<CourseMetadataItemT | null> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new GetCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: "metadata",
        },
    });

    const response = await dbClient.send(input);
    if (!response.Item) return null;
    
    const decoded = CourseMetadataItem.decode(response.Item);
    if (isLeft(decoded)) { // an item matched but did not match our schema
        throw new InternalValidationError();
    }

    return decoded.right;
}

export async function getCourseQueueOrder(courseId: string): Promise<CourseQueueOrderItemT | null> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new GetCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: "order"
        }
    });

    const response = await dbClient.send(input);
    if (!response.Item) return null;

    const decoded = CourseQueueOrderItem.decode(response.Item);
    if (isLeft(decoded)) {
        throw new InternalValidationError();
    }

    return decoded.right;
}

export async function addRequestToOrder(courseId: string, requestId: string) {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new UpdateCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: "order"
        },
        UpdateExpression: "set #order = list_append(#order, :newRequestList)",
        ExpressionAttributeNames: {
            "#order": "order"
        },
        ExpressionAttributeValues: {
            ":newRequestList": [ requestId ]
        },
        ReturnValues: "ALL_NEW"
    });

    const output = await dbClient.send(input);
    const decoded = CourseQueueOrderItem.decode(output.Attributes);
    if (isLeft(decoded)) {
        throw new InternalValidationError();
    };

    return decoded.right.order;
}

export async function updateRequestStatus(courseId: string, requestId: string, nextStatus: REQUEST_STATUS) {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    let input: UpdateCommand;
    if (nextStatus === REQUEST_STATUSES.CLOSED) {
        input = new UpdateCommand({
            TableName: process.env.COURSES_TABLE_NAME,
            Key: {
                courseId,
                subKey: `requestStatus`
            },
            UpdateExpression: `remove #requestId`,
            ExpressionAttributeNames: {
                "#requestId": requestId,
            },
            ReturnValues: "ALL_NEW"
        });
    } else {
        input = new UpdateCommand({
            TableName: process.env.COURSES_TABLE_NAME,
            Key: {
                courseId,
                subKey: `requestStatus`
            },
            UpdateExpression: `set #requestId = :status`,
            ExpressionAttributeNames: {
                "#requestId": requestId,
            },
            ExpressionAttributeValues: {
                ":status": nextStatus,
            },
            ReturnValues: "ALL_NEW"
        });
    }

    const output = await dbClient.send(input);
    delete output.Attributes?.subKey;
    delete output.Attributes?.courseId;

    const decoded = CourseQueueOrderStatusItem.decode(output.Attributes);
    if (isLeft(decoded)) {
        throw new InternalValidationError();
    }

    return decoded.right;
}

export async function removeRequestFromOrder(courseId: string, requestId: string) {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const courseOrder = await getCourseQueueOrder(courseId);
    if (!courseOrder) return [];

    const index = courseOrder.order.indexOf(requestId);
    if (index == -1) return courseOrder.order;

    const input = new UpdateCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: "order"
        },
        UpdateExpression:  `remove #order[${index}]`,
        ExpressionAttributeNames: {
            "#order": "order"
        },
        ReturnValues: "ALL_NEW"
    });

    const output = await dbClient.send(input);
    const decoded = CourseQueueOrderItem.decode(output.Attributes);
    if (isLeft(decoded)) {
        throw new InternalValidationError();
    };

    return decoded.right.order;
}

export async function getRequestStatuses(courseId: string) {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new GetCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: "requestStatus"
        },
    });

    const output = await dbClient.send(input);
    delete output.Item?.subKey;
    delete output.Item?.courseId;
    console.log(output);
    const decoded = CourseQueueOrderStatusItem.decode(output.Item);

    if (isLeft(decoded)) {
        throw new InternalValidationError();
    }

    return decoded.right;
}