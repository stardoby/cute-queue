import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import assert from  "node:assert";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import dbClient from "../src/db/client";

assert(typeof process.env.COURSES_TABLE_NAME !== 'undefined');

const createTable = async () => {
    await dbClient.send(
        new CreateTableCommand({
            TableName: process.env.COURSES_TABLE_NAME, 
            BillingMode: 'PAY_PER_REQUEST',
            AttributeDefinitions: [
                {
                    AttributeName: "courseId",
                    AttributeType: "S"
                },
                {
                    AttributeName: "subKey",
                    AttributeType: "S"
                },
                {
                    AttributeName: "memberId",
                    AttributeType: "S"
                }
            ],
            KeySchema: [
                {
                    AttributeName: "courseId",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "subKey",
                    KeyType: "RANGE"
                }
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "membership",
                    KeySchema: [
                        {
                            AttributeName: 'memberId',
                            KeyType: "HASH"
                        } 
                    ],
                    Projection: {
                        ProjectionType: "ALL"
                    }
                }
            ]
        })
    )
}


const main = async () => {
    await createTable();
}

main();

