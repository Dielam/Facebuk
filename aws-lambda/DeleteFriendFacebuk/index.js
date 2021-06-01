const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {
    
    const username = event.requestContext.authorizer.claims['cognito:username'];
    
    const requestBody = JSON.parse(event.body);
    
    const friend = requestBody.Friend;
    
    var paramsUserReceptor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :u',
        ProjectionExpression: 'FriendshipId',
        FilterExpression: 'Confirmation = :c AND UserEmisor = :f',
        ExpressionAttributeValues: { 
          ':u': username,
          ':f': friend,
          ':c': true
        },
    }
    
    var paramsUserEmisor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserEmisor_index',
        KeyConditionExpression: 'UserEmisor = :u',
        ProjectionExpression: 'FriendshipId',
        FilterExpression: 'Confirmation = :c AND UserReceptor = :f',
        ExpressionAttributeValues: { 
          ':u': username,
          ':f': friend,
          ':c': true
        },
    }

    deleteFriend(paramsUserReceptor, paramsUserEmisor).then((data) => {
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({data}),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};

function deleteFriend(paramsUserReceptor, paramsUserEmisor){
  return new Promise((resolve, reject) => {
    ddb.query(paramsUserReceptor, function(err, dataReceptor) {
      if (err) {
        reject(err);
      } else {
        ddb.query(paramsUserEmisor, function(err, dataEmisor) {
          if (err) {
            reject(err);
          } else {
            if(dataEmisor.Items.length !== 0 || dataReceptor.Items.length !== 0){
                var param = {
                    TableName: 'FriendsFacebuk',
                    Key: {
                        'FriendshipId': ""
                    }
                };
                if(dataEmisor.Items.length !== 0) param.Key.FriendshipId = dataEmisor.Items[0].FriendshipId;
                else param.Key.FriendshipId = dataReceptor.Items[0].FriendshipId;
                ddb.delete(param, function(err, data) {
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
