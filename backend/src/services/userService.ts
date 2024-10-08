import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

import dbClient from "../db/client";
import { assertEnvExists } from "../utils/assertsEnvExists";
import { UserMembershipItem } from "../schemas/userMembershipItem";
import { InternalValidationError } from "../errors/InternalValidationError";

import type { ROLE } from "../constants";
import type { UserMembershipItemT } from "../schemas/userMembershipItem";

/**
 * Fetch user membership in courses
 * @param userId The userId to fetch the membership for
 * @returns the course IDs the user is a members of, aggregated by role
 */
export async function getUserMembership(userId: string): Promise<UserMembershipItemT[]> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    // Fire off the request to the users GSI 
    const output = await dbClient.send(
        new QueryCommand({
            TableName: process.env.COURSES_TABLE_NAME,
            IndexName: "membership",
            ExpressionAttributeValues: {
               ":userId": userId,
            },
            KeyConditionExpression: "memberId = :userId"
         })
    );
    const responses = output.Items ?? [];

    // Validate the database entry is what we expect
    return responses.map((x: unknown) => {
        const decoded = UserMembershipItem.decode(x);
        if (isLeft(decoded)) {
            throw new InternalValidationError(PathReporter.report(decoded).toString());
        }
        return decoded.right;
    });
}

export async function getUserMembershipForCourse(userId: string, courseId: string): Promise<ROLE | null> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const input = new GetCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Key: {
            courseId,
            subKey: `member:${userId}`,
        },
    });

    const response = await dbClient.send(input);
    if (!response.Item) {
        return null;
    }

    const decoded = UserMembershipItem.decode(response.Item);
    if (isLeft(decoded)) {
        throw new InternalValidationError(PathReporter.report(decoded).join(";"));
    }

    return decoded.right.role;
}

export async function joinUserToCourse(memberId: string, courseId: string, role: ROLE): Promise<void> {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    // Build put command with this inptu
    const item: UserMembershipItemT = {
        role,
        courseId,
        memberId,
        subKey: `member:${memberId}`,
    };
    const input = new PutCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Item: item
    });
    await dbClient.send(input);
}
