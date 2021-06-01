const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {

    const userFacebukId = toUrlString(randomBytes(16));
    console.log('Received event (', userFacebukId, '): ', event);

    const requestBody = JSON.parse(event.body);
    
    const user = requestBody.User;

    register(userFacebukId, user).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                UserFacebukId: userFacebukId,
                User: user.Username,
                FullName: user.FullName,
                Password: user.Password,
                Email: user.Email,
                Birthdate: user.Birthdate,
                Gender: user.Gender,
                Img: user.Img,
                StatusText: "empty"
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function register(userFacebukId, user) {
    return ddb.put({
        TableName: 'UsersFacebuk',
        Item: {
            UserFacebukId: userFacebukId,
            User: user.Username,
            FullName: user.FullName,
            Email: user.Email,
            Password: user.Password,
            Birthdate: user.Birthdate,
            Gender: user.Gender,
            Img: user.Img,
            StatusText: "empty"
        },
    }).promise();
}

function toUrlString(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
