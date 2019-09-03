
var AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION
});

var dynamodb = new AWS.DynamoDB();

exports.handler = (event) => {
  let apiGwId = event.requestContext.apiId;
  var domain = "${apiGwId}.execute-api.${process.env.AWS_REGION}.amazonaws.com";
  var stage = process.env.WS_STAGE;
  var params = {
    TableName: process.env.DB_CLIENT_TABLE;
  };

  let promise = dynamodb.scan(params).promise();

  promise
  .then(function(data) {
    return handle(data, domain, stage, event);
  })
  .catch(function(err) { console.log("error: ", err);});

  return { "statusCode": 200 };
};

function handle(data, domain, stage, event) {
  var json = JSON.parse(JSON.stringify(data, null, 2));

  var payload = createFrontendNotification(event);
  persistNotification(event);

  var apigw = new AWS.ApiGatewayManagementApi({apiVersion: '2018-11-29',endpoint: domain + '/' + stage});
  return json.Items.map(function(value) {
    return value.connection_id.S;
  }).map(value => {
    console.log("sending message to client: ", value, payload);
    apigw.postToConnection({ ConnectionId: value, Data: JSON.stringify(payload)}).promise();
  });
}

function persistNotification(event) {
  var params = {
    TableName: process.env.DATABASE_TABLE_NOTIFICATIONS,
    Item:{
      'notificationId' : { S: event.notificationId },
      'type': { S: event.type },
      'level' : { S: event.level },
      'event': { S: event.event },
      'timestamp' : {S: event.timestamp.toString()}
    }
  };

  return dynamodb.putItem(params).promise();
}

function createFrontendNotification(event) {
  return {
    "type" : event.type,
    "notificationId": event.notificationId,
    "timestamp": event.timestamp,
    "level": event.level,
    "payload": {
      "event": event.event
    }
  };
}
