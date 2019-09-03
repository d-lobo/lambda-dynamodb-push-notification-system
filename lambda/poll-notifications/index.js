
var AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION
});

var dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
  var connectionId = event.requestContext.connectionId;
  var id = '';
  var notificationPromise = lookupNotifications(id);
  sendNotifications(notificationPromise, connectionId, event.requestContext.domainName, event.requestContext.stage);
  callback(null,{ "statusCode": 200 });
};


function lookupNotifications(id) {
  var params = {
    TableName : process.env.DATABASE_TABLE_NOTIFICATIONS,
    ProjectionExpression:"",
    KeyConditionExpression: "",
    FilterExpression: "",
    ExpressionAttributeNames: {

    },
    ExpressionAttributeValues: {

    }
  };

  return dynamodb.query(params).promise();
}

function sendNotifications(notificationPromise, connectionId, domain, stage) {

  notificationPromise.then(function (data) {
    var frontendNotifications = data.Items.map(n => {
      return {
        "type": n.type || '',
        "notificationId": n.notificationId || '' ,
        "timestamp": n.timestamp || '',
        "level": n.level || '',
        "payload": {
          "event": n.event || ''
        }
      };
    });

    var apigw = new AWS.ApiGatewayManagementApi({apiVersion: '2018-11-29',endpoint: domain + '/' + stage});
    var pms = frontendNotifications.map(fN => {
      return apigw.postToConnection({ ConnectionId: connectionId, Data: JSON.stringify(fN)}).promise();
    });
    return pms;
  }, function(err) {
    console.log("error: ", err);
  });
}
