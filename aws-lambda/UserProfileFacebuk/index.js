const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const username = event['pathParameters']['username'];
    
    const user = event.requestContext.authorizer.claims['cognito:username'];
    
    var paramsUserReceptor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :ur',
        ProjectionExpression: 'Confirmation',
        FilterExpression: 'UserEmisor = :ue',
        ExpressionAttributeValues: { 
          ':ur': username,
          ':ue': user
        },
    }
    
    var paramsUserEmisor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserEmisor_index',
        KeyConditionExpression: 'UserEmisor = :ue',
        ProjectionExpression: 'Confirmation',
        FilterExpression: 'UserReceptor = :ur',
        ExpressionAttributeValues: { 
          ':ue': username,
          ':ur': user
        },
    }
    
    var params = {
      TableName: 'UsersFacebuk',
      Key: {
          'User': username
      },
      ProjectionExpression: 'UserFacebukId,FullName,Email,Gender,Birthdate,StatusText,Img'
    }

    profile(params, paramsUserEmisor, paramsUserReceptor).then((data) => {
      if(user==username){
        data.FullName = "CURRENT_USER";
      }
      callback(null, {
          statusCode: 200,
          body: JSON.stringify({ 
              User: data,
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

function profile(params, paramsUserEmisor, paramsUserReceptor){
  return new Promise((resolve, reject) => {
    ddb.query(paramsUserReceptor, function(err, dataReceptor) {
      if (err) {
        reject(err);
      } else {
        ddb.query(paramsUserEmisor, function(err, dataEmisor) {
          if (err) {
            reject(err);
          } else {
            ddb.get(params, function(err, data) {
              if (err) {
                reject(err);
              } else {
                var friendStatus;
                if(dataEmisor.Count == 0 && dataReceptor.Count == 0) data.UserStatus = "NO_RESULT";
                else{
                  if(dataEmisor.Count !== 0) friendStatus = dataEmisor.Items[0].Confirmation;
                  if(dataReceptor.Count !== 0) friendStatus = dataReceptor.Items[0].Confirmation;
                  if(friendStatus) data.UserStatus = "FRIENDS";
                  else data.UserStatus = "FRIEND_REQUEST";
                }
                resolve(data);
              }
            });
          }
        });
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