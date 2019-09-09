
var AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION
});

var dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
  var connectionId = event.requestContext.connectionId;
  var body = JSON.parse(event.body);
  var userId = body['userId'];

  lookupNotifications(userId)
    .then(data => {
      sendNotifications(data, connectionId, event.requestContext.domainName, event.requestContext.stage);
      callback(null,{ "statusCode": 200 });
    })
    .error(err => {
      console.log("err: ", err);
      callback(null, {"statusCode": 500});
    });
};


function lookupNotifications(id) {
  var params = {
    TableName : process.env.DATABASE_TABLE_NOTIFICATIONS,
    IndexName: "userId-index", //assumes primary key is userId or a gsi exist for this table named 'userId-index'
    ProjectionExpression:"userId, content",
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId"
    },
    ExpressionAttributeValues: {
      ":userId" : id
    }
  };
  return dynamodb.query(params).promise();
}

function sendNotifications(data, connectionId, domain, stage) {
    var frontendNotifications = data.Items.map(n => {
      return {
        "userId": n.userId || '' ,
        "cotent": n.content || '',
      };
    });
    var apigw = new AWS.ApiGatewayManagementApi({apiVersion: '2018-11-29',endpoint: domain + '/' + stage});
    var pms = frontendNotifications.map(fN => {
      return apigw.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(fN)}).promise();
    });
    return pms;
}
