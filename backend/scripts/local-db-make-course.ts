import add from 'date-fns/add';
import * as dotenv from "dotenv";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ulid } from "ulid";

dotenv.config({ path: ".env.local" });

import dbClient from "../src/db/client";
import { assertEnvExists } from "../src/utils/assertsEnvExists";

const putCourse = async () => {
    assertEnvExists(process.env.COURSES_TABLE_NAME);
    
    const item = await dbClient.send(new PutCommand({
        TableName: process.env.COURSES_TABLE_NAME,
        Item: {
            courseId: ulid(),
            subKey: "metadata",
            name: "Test Queue",
            schedule: [
                {
                    dayOfWeek: "WEDNESDAY",
                    opensAt: "10:00 PM",
                    closesAt: "11:30 PM"
                }
            ],
            location: "Pluto 219",
            resources: [
                {
                    text: "Discussion forum",
                    url: "https://edstem.org/us/dashboard"       
                }
            ]
        }
    }));

    console.log(item);
}

putCourse();
