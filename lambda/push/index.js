var AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION
});

var dynamodb = new AWS.DynamoDB();

exports.handler = (event) => {
  let apiGwId = event.requestContext.apiId;
  var domain = "${apiGwId}.execute-api.${process.env.AWS_REGION}.amazonaws.com";
  var stage = process.env.WS_STAGE;
  var body = JSON.parse(event.body);
  var userId = body['userId']
  var content = body;
  var persist = body['persist'];

  var params = {
    TableName: process.env.DB_CLIENT_TABLE,
    ProjectionExpression: "connection_id, userId",
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId"
    },
    ExpressionAttributeValues: {
      ":userId": userId
    }
  };

  let promise = dynamodb.query(params).promise();

  promise
  .then(clients => {
    push(clients, content, persist, domain, stage);
    return {"statusCode": 200};
  })
  .catch(err => {
    console.log("err: ", err);
    return {"statusCode": 500};
  });
};

function push(clients, content, persist, domain, stage) {
  var notification = createFrontendNotification(content);

  if (persist) {
    persistNotification(content);
  }

  var apigw = new AWS.ApiGatewayManagementApi(
      {apiVersion: '2018-11-29', endpoint: domain + '/' + stage});

  return clients.Items.map(client => client.connection_id.S).map(
      connectionId => {
        console.log("sending message to client(%s): %s", connectionId,
            notification);
        apigw.postToConnection({
          ConnectionId: value,
          Data: JSON.stringify(notification)
        }).promise();
      });
}

function persistNotification(notification) {
  var params = {
    TableName: process.env.DATABASE_TABLE_NOTIFICATIONS,
    Item: {
      'userId': { S : notification.userId},
      'content': { S : notification.content}
    }
  };
  return dynamodb.putItem(params).promise();
}

function createFrontendNotification(notification) {
  return {
    "userId": notification.userId,
    "content": notification.content
  };
}
