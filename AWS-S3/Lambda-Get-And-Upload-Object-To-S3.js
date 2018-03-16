const LOG4JS = require('log4js');
let logger = LOG4JS.getLogger('NemoSiteScraper Lambda');
logger.level = 'debug';

const async = require('async');

const request = require('request');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

//Lambda handler
exports.handler = function (event, context, callback) {

      let resultItemQ = [];

      let s3Params = {
          Bucket: 'ftp-to-s3-testing',
          Key: 'AMLEOInventory.txt'
      }

      s3.getObject(s3Params, (err, data) => {
          if (err) logger.error('Error reading: ' + err);
          else {

              //Package turn into JSON object
              data.Body.toString().split('\n').forEach(line => {

                  if (line !== '') {
                        let productNumber = line.split('\t')[0].replace('\'','');
                        let quantity = line.split('\t')[1].replace('\r','');

                        resultItemQ.push(
                            {
                                ProductNumber: productNumber,
                                QuantityAvailable: quantity
                            }
                        )
                  }
              })
              resultItemQ.shift();

              let s3paramsUpload = {
                  Bucket: 'ftp-to-s3-testing',
                  Key: 'AMLEOInventory.json',
                  Body: JSON.stringify(resultItemQ)
              };

              //JSON package is uploaded to S3
              s3.upload(s3paramsUpload, (err,data) => {
                  if (err) logger.error('Error uploading the file into S3', err);
                  else context.succeed(data);
              })

          }
      })
}
