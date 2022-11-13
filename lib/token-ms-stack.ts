import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import {
  DomainName,
  EndpointType,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { CfnApiMapping } from "aws-cdk-lib/aws-apigatewayv2";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

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
    const api = new RestApi(this, "Token API", {
      endpointTypes: [EndpointType.REGIONAL],
    });
    api.root.addMethod("POST", new LambdaIntegration(handleTokenUser));

    new CfnApiMapping(this, `token-path-mapping`, {
      apiId: api.restApiId,
      domainName: subdomain,
      stage: api.deploymentStage.stageName,
      apiMappingKey: "v1/token",
    });
  }
}
