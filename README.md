# lambda-dynamodb-push-notification-system
An AWS lambda, DynamoDB & API Gateway Websocket based push notification system

## Status: WIP

## Overview
This is an example project for an AWS based push notification system for websocket clients.

The intention is to push notifications from a backend to frontend web based clients connected via websockets and AWS infrastructure.

Its composed by several AWS lambda functions (node-js) and use of AWS services: e.g. DynamoDB, API Gateway Websockets (manual setup required).

This spares your backend from handling several websocket connections as its only requires to trigger a Lambda function with customizable input

Notifications get directly pushed to the client, and may optionally persisted with a TTL, enabling the client to receive a historical notification stream

### Lambda
Lambda functions comprise the core of this system and are triggered by AWS API Gateway or backend.
 
* connect
  * persists connection id of client and userId
* disconnect
  * purges client connection data
* push
  * pushes notification to specified client (and optionally persist) 
* poll
  * if persisted message exists: poll a history - invoked by client
* (verify-jwt)
  * client JWT authorization (optional)
  
Its required to bind certain lambda functions to API Gateway routes in order to trigger them by client.
A possible backend - residing on ec2 or with access to AWS Lambda functions - may push notifications to clients    

### TODO: API Gateway 
 #### Websockets
 ##### Routes
 * $connect: lambda-integeration
 * $disconnect: lambda-integeration
 * push: lambda-integeration
 * poll: lambda-integeration
 * $default - configure mock integration 

### TODO: Client Authorization
 #### JWT 
 
### TODO: DynamoDB
The setup requires two dynamo db tables
 * clients - carries client connection data
 * notifications - carries persisted notification for delayed retrival

#### clients
Primary Key: connectionId (String)

Attributes: connectionId, userId 

GSI: userId-index (column: userId)

The clients table requires the connectionId of the connecting websocket client to be stored as primary key.
The connectionId is available in the lambda function, if the function is triggered by the $connect route of the gateway.

#### notifications
Primary Key: userId

Attributes: userId, content, ```<extendIfDesired>```
 