import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { pbkdf2Sync } from "crypto";
import { sign } from "jsonwebtoken";
import { statusCreate, statusFail } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) return statusFail();
  const { email, password } = JSON.parse(event.body);
  if (!email) return statusFail("Missing email");
  if (!password) return statusFail("Missing password");

  const client = new DynamoDB();
  const data = await client
    .query({
      TableName: "Users",
      IndexName: "indexEmail",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": { S: email } },
      Limit: 1,
    })
    .promise();
  const user =
    data?.Items?.[0] && DynamoDB.Converter.unmarshall(data?.Items?.[0]);
  if (!user) return statusFail("Unauthorized");
  const hashedPassword = pbkdf2Sync(
    password,
    "thisisthesalt",
    1000,
    64,
    "sha512"
  ).toString("hex");
  console.log(user.password, hashedPassword);
  if (user.password !== hashedPassword) return statusFail("Unauthorized");

  return statusCreate({
    token: sign({ uuid: user.id }, "thisisthejwtsecret"),
  });
};
