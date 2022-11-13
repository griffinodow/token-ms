#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TokenMsStack } from "../lib/token-ms-stack";

const app = new cdk.App();
new TokenMsStack(app, "TokenMsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
