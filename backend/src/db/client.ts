import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let client: DynamoDBClient;

// Construct our DynamoDB client, specifying our local credenitals if we're in dev mode
if (process.env.NODE_ENV === 'production') {
    client = new DynamoDBClient({});
} else {
    client = new DynamoDBClient({
        endpoint: process.env.DYNAMO_LOCAL_ENDPOINT,
        credentials: {
            accessKeyId: "fakeMyKeyId",
            secretAccessKey: "fakeSecretAccessKey",
            sessionToken: "nothing"
        },
        region: "us-west-2"
    });
}

// We work with the document client instead because it is nicer
const documentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true,
    }
});

export default documentClient;
