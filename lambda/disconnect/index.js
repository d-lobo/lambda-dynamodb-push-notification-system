var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});


exports.handler = async (event) => {
    var connectionId = event.requestContext.connectionId;
    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName: process.env.DB_CLIENT_TABLE,
        Key:{
            'connection_id': { S: connectionId }
        }
    };
    console.log("disconnecting client ", connectionId);

    return dynamodb.deleteItem(params).promise();
};
