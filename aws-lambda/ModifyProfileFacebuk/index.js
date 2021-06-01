const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const username = event.requestContext.authorizer.claims['cognito:username'];
    
    const requestBody = JSON.parse(event.body);
    
    const data = requestBody.Data;
    
    var params = {
      TableName: 'UsersFacebuk',
      Key: {
          'User': username
      },
      UpdateExpression: "SET FullName = :f, Birthdate = :b, Gender = :g, Img = :i",
      ExpressionAttributeValues:{
          ':f' : data.FullName,
          ':b' : data.Birthdate,
          ':g' : data.Gender,
          ':i' : data.Img
      },
      ReturnValues:'ALL_NEW'
    }

    profile(params).then((data) => {
      callback(null, {
          statusCode: 200,
          body: JSON.stringify({ 
              UpdatedData: data
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
    ddb.update(params, function(err, data) {
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