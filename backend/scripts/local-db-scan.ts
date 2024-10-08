import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import dbClient from "../src/db/client";
import { assertEnvExists } from "../src/utils/assertsEnvExists";


const scanDb = async () => {
    assertEnvExists(process.env.COURSES_TABLE_NAME);

    const response = await dbClient.send(new ScanCommand({
        TableName: process.env.COURSES_TABLE_NAME
    }));

    console.log(response);
}

scanDb();
