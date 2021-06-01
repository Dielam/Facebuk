const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {
    
    const commentFacebukId = toUrlString(randomBytes(16));
    console.log('Received event (', commentFacebukId, '): ', event);
    
    const userReceptor = event['pathParameters']['username'];
    
    const userEmisor = event.requestContext.authorizer.claims['cognito:username'];
    
    const requestBody = JSON.parse(event.body);
    
    const commentText = requestBody.Comment;
    
    var paramsUserReceptor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :ur',
        ProjectionExpression: 'FriendshipId',
        FilterExpression: 'Confirmation = :c AND UserEmisor = :ue',
        ExpressionAttributeValues: { 
          ':ur': userReceptor,
          ':ue': userEmisor,
          ':c': true
        },
    }
    
    var paramsUserEmisor = {
        TableName: 'FriendsFacebuk',
        IndexName: 'UserEmisor_index',
        KeyConditionExpression: 'UserEmisor = :ur',
        ProjectionExpression: 'FriendshipId',
        FilterExpression: 'Confirmation = :c AND UserReceptor = :ue',
        ExpressionAttributeValues: { 
          ':ue': userEmisor,
          ':ur': userReceptor,
          ':c': true
        },
    }

    addComment(commentFacebukId, commentText, userEmisor, userReceptor, paramsUserReceptor, paramsUserEmisor).then((data) => {
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({
                Comment:{
                    "CommentFacebukId": commentFacebukId,
                    "UserEmisor": userEmisor,
                    "UserReceptor": userReceptor,
                    "CommentText": commentText
                }
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

function addComment(commentFacebukId, commentText, userEmisor, userReceptor, paramsUserReceptor, paramsUserEmisor){
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
                  TableName: 'CommentsFacebuk',
                  Item: {
                      CommentFacebukId: commentFacebukId,
                      UserEmisor: userEmisor,
                      UserReceptor: userReceptor,
                      CommentText: commentText
                  }
              };
              ddb.put(param, function(err, data) {
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
