const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const username = event.requestContext.authorizer.claims['cognito:username'];
    
    var paramsUserReceptor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :u',
        ProjectionExpression: 'UserEmisor',
        FilterExpression: 'Confirmation = :c',
        ExpressionAttributeValues: { 
          ':u': username,
          ':c': true
        },
    }
    
    var paramsUserEmisor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserEmisor_index',
        KeyConditionExpression: 'UserEmisor = :u',
        ProjectionExpression: 'UserReceptor',
        FilterExpression: 'Confirmation = :c',
        ExpressionAttributeValues: { 
          ':u': username,
          ':c': true
        },
    }

    friends(paramsUserReceptor, paramsUserEmisor).then((users) => {
      if(users.Responses.UsersFacebuk.length === 0){
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({ 
              Users: "EMPTY"
          }),
          headers: {
              'Access-Control-Allow-Origin': '*',
          },
        });
      }
      else{
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({ 
                Users: users
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
      }
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
  };

function friends(paramsUserReceptor, paramsUserEmisor){
  return new Promise((resolve, reject) => {
    ddb.query(paramsUserReceptor, function(err, dataReceptor) {
      if (err) {
        reject(err);
      } else {
        ddb.query(paramsUserEmisor, function(err, dataEmisor) {
          if (err) {
            reject(err);
          } else {
            var param = {
                RequestItems: {
                  'UsersFacebuk': {
                    Keys: [ ],
                    ProjectionExpression: 'UserFacebukId,FullName,Img,Email'
                    }
                }
            };
            dataReceptor.Items.forEach(function(element, index, array) {
                param.RequestItems.UsersFacebuk.Keys.push({'User': element.UserEmisor});
            });
            dataEmisor.Items.forEach(function(element, index, array) {
                param.RequestItems.UsersFacebuk.Keys.push({'User': element.UserReceptor});
            });
            if(dataEmisor.Items.length === 0 && dataReceptor.Items.length === 0){
              var users = {
                "Responses": {
                  "UsersFacebuk":[]
                }
              };
              resolve(users);
            }
            else{
              ddb.batchGet(param, function(err, data) {
                if (err) {
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