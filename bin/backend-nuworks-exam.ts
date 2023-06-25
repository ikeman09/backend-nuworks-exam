#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendNuworksExamStack } from '../lib/backend-nuworks-exam-stack';

const app = new cdk.App();
new BackendNuworksExamStack(app, `BackendNuworksExamStack-${process.env.ENVIRONMENT}`, {
  stackName: `BackendNuworksExamStack-${process.env.ENVIRONMENT}`
});
