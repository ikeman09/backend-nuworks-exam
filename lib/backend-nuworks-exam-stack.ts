import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
const environments = require('./environments')

export class BackendNuworksExamStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Lambda NodeJS Layer
     */
    const lambdaNodejsLayer = new lambda.LayerVersion(this, 'lambdaNodejsLayer', {
      code: lambda.Code.fromAsset('src/layers/nodeLibs'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      description: 'Lambda NodeJS Layer',
    })

    /**
     * API Gateway
     */
    const api = new apigateway.RestApi(this, 'api', {
      restApiName: 'BackendNuworksExam',
      description: 'Backend Nuworks Exam',
      deployOptions: {stageName: environments.ENVIRONMENT},
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      binaryMediaTypes: ['image/jpeg'],
      defaultCorsPreflightOptions: {
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ["*"]
      }
    })

    /**
     * Lambda Function
     */
    const todo = new lambda.Function(this, 'todo', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('src/functions/todo'),
      handler: 'todo.handler',
      layers: [lambdaNodejsLayer],
      environment: {
        ENVIRONMENT: environments.ENVIRONMENT,
        MONGO_CLUSTER: environments.MONGO_CLUSTER,
        MONGO_USERNAME: environments.MONGO_USERNAME,
      }
    })

    // API Gateway Integration
    const todoIntegration = new apigateway.LambdaIntegration(todo)
    const todoResource = api.root.addResource('todo')
    todoResource.addMethod('GET', todoIntegration)
    todoResource.addMethod('POST', todoIntegration)
    todoResource.addMethod('PUT', todoIntegration)
    todoResource.addMethod('DELETE', todoIntegration)
  }
}
