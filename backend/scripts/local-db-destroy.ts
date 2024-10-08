import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import assert from  "node:assert";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import dbClient from "../src/db/client";

assert(typeof process.env.COURSES_TABLE_NAME !== 'undefined');

const deleteTable = async () => {
    await dbClient.send(new DeleteTableCommand({
        TableName: process.env.COURSES_TABLE_NAME
    }));
};

const main = async () => {
    await deleteTable();
}

main();
