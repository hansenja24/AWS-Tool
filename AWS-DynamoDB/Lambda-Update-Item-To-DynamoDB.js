const LOG4JS = require('log4js');
let logger = LOG4JS.getLogger('NemoSiteScraper Lambda');
logger.level = 'debug';

const async = require('async');

const request = require('request');

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

//Lambda Handler
exports.handler = function (event, context, callback) {
    // https://8cr5vzgtq5.execute-api.us-west-2.amazonaws.com/prod?email=hansen2@hansen.com&productId=123&siteId=aml
    if (event == null) {
        context.fail('Nothing passed in!');
    } else {

        let emailInput = event.body.email;
        let productIdInput = event.body.productid;
        let siteIdInput = event.body.siteid;
        let nameInput = event.body.name;
        let tableSiteId;

        //Checking what type of website
        if (siteIdInput === 'aml') {
            tableSiteId = 'aml-oos-inventory';
        } else if ( siteIdInput === "ge") {
            tableSiteId = 'ge-oos-inventory';
        }

        let readParams = {
            TableName: tableSiteId,
            Key: {
                productid: productIdInput
            }
        };

        //Check if the product input number is already exist in database or not
        dynamodb.get(readParams, (err, data) => {
            if (err) {
                logger.error(`Error reading ${siteIdInput} dynamoDB: `, err);
            } else {

                let emailParams;
                if (Object.keys(data).length == 0) {
                    emailParams = [emailInput];
                } else if (!data.Item.email.includes(emailInput)) {
                    //the database will have a column of emails in array
                    data.Item.email.push(emailInput);
                    emailParams = data.Item.email;
                }

                let params = {
                    ExpressionAttributeValues: {
                        ':EMAIL': emailParams,
                        ':NAME': nameInput
                    },
                    ExpressionAttributeNames: {
                        '#EMAIL': 'email',
                        '#NAME': 'name'
                    },
                    TableName: tableSiteId,
                    UpdateExpression:'SET #EMAIL = :EMAIL, #NAME = :NAME',
                    Key: {
                        productid: productIdInput
                    }
                 };

                 console.log(params);
                dynamodb.update(params, (err, data) => {
                    if (err) {
                        logger.error(`Error updating ${tableSiteId} DynamoDB: `, err)
                    } else {
                        logger.info(` ${productIdInput} updated in DynamoDB table ${tableSiteId}`);
                        context.succeed(data);
                    }
                });
            }
        });
      }
}
