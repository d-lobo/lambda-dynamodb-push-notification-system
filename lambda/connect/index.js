var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

var dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {
    //persist connectionId of ws client
    var connectionId = event.requestContext.connectionId;

    var params = {
        TableName: process.env.DB_CLIENT_TABLE,
        Item:{
            'connection_id': { S: connectionId },
        }
    };

    console.log("connecting websocket client: ", connectionId);
    return dynamodb.putItem(params).promise();
};

