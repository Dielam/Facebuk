

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {

    const userEmisor = event['pathParameters']['username'];
    
    const userReceptor = event.requestContext.authorizer.claims['cognito:username'];
    
    const requestBody = JSON.parse(event.body);
    
    const confirmation = requestBody.Confirmation;
    
    var params = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :ur',
        ProjectionExpression: 'FriendshipId',
        FilterExpression: 'UserEmisor = :ue',
        ExpressionAttributeValues: { 
          ':ur': userReceptor,
          ':ue': userEmisor
        }
    }

    responseFriendRequest(params, confirmation).then((data) => {
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

function responseFriendRequest(params, confirmation) {
    return new Promise((resolve, reject) => {
        ddb.query(params, function(err, data) {
            if (err) {
            reject(err);
            } else {
                if(confirmation){
                    console.log(data.Items[0].FriendshipId);
                    var paramUpdate = {
                        TableName: 'FriendsFacebuk',
                        Key: {
                            'FriendshipId': data.Items[0].FriendshipId
                        },
                        UpdateExpression: "SET Confirmation = :c",
                        ExpressionAttributeValues:{
                            ":c": true
                        },
                        ReturnValues:"UPDATED_NEW"
                    }
                    ddb.update(paramUpdate, function(err, data) {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(data);
                      }
                    });
                }
                else{
                    var paramDelete = {
                        TableName: 'FriendsFacebuk',
                        Key: {
                            'FriendshipId': data.Items[0].FriendshipId
                        }
                    };
                    ddb.delete(paramDelete, function(err, data) {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(data);
                      }
                    });
                }
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
