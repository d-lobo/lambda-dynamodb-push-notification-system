/*
 * adds support for (legacy) websocket clients to perform jwt-verification
 */
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const keyClient = jwksClient({
    cache: true,
    cacheMaxAge: 86400000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
    strictSsl: true,
    jwksUri: process.env.JWKS_URI
});

const verificationOptions = {
    "algorithms": "RS256"
};

function getSigningKey (header = decoded.header, callback) {
    keyClient.getSigningKey(header.kid, function(err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

function extractBearerToken(header) {
    if (header.Authorization && header.Authorization.split(' ')[0] === 'Bearer') {
        return header.Authorization.split(' ')[1];
    } else {
        return header.Authorization;
    }
}

function extractTokenFromQueryParam(queryParams) {

}

function validateToken(token, awsAccountId, apiGwId, callback) {
    let connectResourceArn = "arn:aws:execute-api:${process.env.AWS_REGION}:${awsAccountId}:${apiGwId}/*/$connect";
    let allow = {
        "principalId": "user",
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Action": "execute-api:Invoke",
                    "Effect": "Allow",
                    "Resource": connectResourceArn
                }
            ]
        }
    };
    jwt.verify(token, getSigningKey, verificationOptions, function (error) {
        if (error) {
            callback("Unauthorized");
        } else {
            callback(null, allow);
        }
    });
}


exports.handler = (event, context, callback) => {
    //use auth either from queryParam or http header (vanilla-js ws clients dont supp header setting)
    let queryAuth = extractBearerToken(event.queryStringParameters) || '';
    let headerAuth = extractBearerToken(event.headers) || '';
    let token;

    //prefer headerAuth
    if (headerAuth != '')
        token = headerAuth;
    else if (queryAuth != '')
        token = queryAuth;

    let awsAccountId = context.invoked_function_arn.split(":")[4];
    let apiGwId = event.requestContext.apiId;

    validateToken(token, awsAccountId, apiGwId, callback);
};
