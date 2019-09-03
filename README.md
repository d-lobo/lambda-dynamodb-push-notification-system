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
  * persists connection id of client 
* disconnect
  * purges client connection data
* push
  * pushes (and optionally persist) notification to client 
* poll
  * if persisted message: poll a history - invoked by client
* (verify-jwt)
  * client JWT authorization
  
Its required to bind certain lambda functions to API Gateway routes in order to trigger them by client.
A possible backend - residing on ec2 or with access to AWS Lambda functions - may push notifications to clients    

### TODO: API Gateway 
 #### Websockets

### TODO: Client Authorization
 #### JWT 
### TODO: DynamoDB
#### clients
#### notifications