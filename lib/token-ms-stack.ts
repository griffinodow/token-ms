import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import {
  EndpointType,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { CfnApiMapping } from "aws-cdk-lib/aws-apigatewayv2";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

export class TokenMsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Constants
    const domain = "griffindow.com";
    const subdomain = `api.tasks.${domain}`;

    // Create token Lambda
    const handleTokenUser = new NodejsFunction(this, "TokenCreateHandler", {
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `../lambda/create.ts`),
    });

    handleTokenUser.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:Query"],
        resources: ["*"],
      })
    );

    // API Gateway
    const api = new RestApi(this, "TokenGw", {
      endpointTypes: [EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
      },
    });
    api.root.addMethod("POST", new LambdaIntegration(handleTokenUser));

    new CfnApiMapping(this, `UsersMsPathMapping`, {
      apiId: api.restApiId,
      domainName: subdomain,
      stage: api.deploymentStage.stageName,
      apiMappingKey: "v1/token",
    });
  }
}
