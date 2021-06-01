const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const username = event.requestContext.authorizer.claims['cognito:username'];
    
    var params = {
      TableName: 'UsersFacebuk',
      Key: {
          'User': username
      },
      ProjectionExpression: 'UserFacebukId,FullName,Gender,Birthdate,StatusText,Img'
    }

    profile(params).then((data) => {
      callback(null, {
          statusCode: 200,
          body: JSON.stringify({ 
              User: data
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

function profile(params){
  return new Promise((resolve, reject) => {
    ddb.get(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
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