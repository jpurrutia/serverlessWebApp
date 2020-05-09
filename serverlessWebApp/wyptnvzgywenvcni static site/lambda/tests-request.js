const uuidv4 = require('uuid/v4')
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
    if (!event.requestContext.authorizer) {
      errorResponse('Authorization not configured', context.awsRequestId, callback);
      return;
    }

    const bucket = 'wyptnvzgywenvcni-files'
    const username = event.requestContext.authorizer.claims['cognito:username'];
    const body = event.body;
    const uploadId = uuidv4()
    const key = `candidates/${username}/${uploadId}/${body}`
    
    console.log(`Uploaded file: ${key}`)
    
    var s3Params = {
        Bucket: bucket,
        Key: key,
        ContentType: 'application/zip',
        CacheControl: 'max-age=60',
        ACL: 'public-read',
    };
    
    let uploadUrl = getUploadURL(s3Params)
    return uploadUrl

};

function getUploadURL(s3Params) {
    return new Promise((resolve, reject) => {
        // Get signed URL
        let uploadURL = s3.getSignedUrl('putObject', s3Params)
        resolve({
          "statusCode": 200,
          "isBase64Encoded": false,
          "headers": {
            "Access-Control-Allow-Origin": "*"
          },
          "body": JSON.stringify({
              "uploadURL": uploadURL
          })
        })
    })
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