const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }
    
    const username = event['pathParameters']['username'];
    
    var params = {
        TableName: 'CommentsFacebuk',
        IndexName: 'UserReceptor_index',
        KeyConditionExpression: 'UserReceptor = :u',
        ProjectionExpression: 'UserEmisor,CommentText',
        ExpressionAttributeValues: { 
          ':u': username,
        },
    }

    comments(params).then((users) => {
      if(users.length === 0){
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
              Users: users,
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

function comments(params){
  return new Promise((resolve, reject) => {
    ddb.query(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        if(data.Items.length === 0){
            var users = [];
            resolve(users);
          }
          
          var commentsUser = [];
          var param = {
            RequestItems: {
              'UsersFacebuk': {
                Keys: [ ],
                ProjectionExpression: 'UserFacebukId,FullName,Img,Email'
              }
            }
          };
          var foundKey;
          var foundIndex;
          data.Items.forEach(function(element, index, array) {
            var dataComment = {
              "dataUser" : {
                "Username" : "",
                "FullName" : "",
                "Img" : "",
                "UserFacebukId" : "",
                "Email" : ""
              },
              "commentText" : []
            } 
            foundKey = param.RequestItems.UsersFacebuk.Keys.find(elementFound => elementFound.User == element.UserEmisor);
            foundIndex = commentsUser.findIndex(commentUser => commentUser.dataUser.Username == element.UserEmisor);
            if(foundIndex == -1){
              dataComment.dataUser.Username = element.UserEmisor;
              dataComment.commentText.push(element.CommentText);
              commentsUser.push(dataComment);
            }
            else commentsUser[foundIndex].commentText.push(element.CommentText);
            if(foundKey == undefined) param.RequestItems.UsersFacebuk.Keys.push({'User': element.UserEmisor});
          });
          ddb.batchGet(param, function(err, data) {
            if (err) {
              reject(err);
            } else {
              var commentsUserAux = commentsUser;
              data.Responses.UsersFacebuk.forEach(function(element, index, array) {
                var str2 = element.Email.split("@");
                commentsUser.forEach(function(element2, index2, array) {
                  var str = element2.dataUser.Username.split("-at-");
                  if(str[0] == str2[0]){
                    commentsUserAux[index2].dataUser.FullName = element.FullName;
                    commentsUserAux[index2].dataUser.Img = element.Img;
                    commentsUserAux[index2].dataUser.Email = element.Email;
                    commentsUserAux[index2].dataUser.UserFacebukId = element.UserFacebukId;
                  }
                });
              });
              resolve(commentsUser);
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