const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }

    const friendshipId = toUrlString(randomBytes(16));
    console.log('Received event (', friendshipId, '): ', event);
    
    const userReceptor = event['pathParameters']['username'];
    
    const userEmisor = event.requestContext.authorizer.claims['cognito:username'];
    
    var paramsUserReceptor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :ur',
        ProjectionExpression: 'Confirmation',
        FilterExpression: 'UserEmisor = :ue',
        ExpressionAttributeValues: { 
          ':ur': userReceptor,
          ':ue': userEmisor
        },
    }
    
    var paramsUserEmisor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserEmisor_index',
        KeyConditionExpression: 'UserEmisor = :ue',
        ProjectionExpression: 'Confirmation',
        FilterExpression: 'UserReceptor = :ur',
        ExpressionAttributeValues: { 
          ':ue': userReceptor,
          ':ur': userEmisor
        },
    }

    friendRequest(friendshipId, userEmisor, userReceptor, paramsUserEmisor, paramsUserReceptor).then(() => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                FriendshipId: friendshipId,
                UserEmisor: userEmisor,
                UserReceptor: userReceptor,
                Confirmation: false
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

function friendRequest(friendshipId, userEmisor, userReceptor, paramsUserEmisor, paramsUserReceptor){
  return new Promise((resolve, reject) => {
      if(userEmisor !== userReceptor){
          ddb.query(paramsUserReceptor, function(err, dataReceptor) {
              if (err) {
                reject(err);
              } else {
                  ddb.query(paramsUserEmisor, function(err, dataEmisor) {
                    if (err) {
                      reject(err);
                    } else {
                        if(dataEmisor.Count == 0 && dataReceptor.Count == 0){
                          var params = {
                            TableName: 'FriendsFacebuk',
                            Item: {
                                FriendshipId: friendshipId,
                                UserEmisor: userEmisor,
                                UserReceptor: userReceptor,
                                Confirmation: false
                            }
                          }
                          ddb.put(params, function(err, data){
                              if(err) {
                                reject(err);
                              } else {
                                resolve(data);
                              }
                          });
                        }
                      }
                  });
              }
          });
      }
  });
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
