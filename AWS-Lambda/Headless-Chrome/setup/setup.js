const LOG4JS = require('log4js');
let logger = LOG4JS.getLogger('NemoSiteScraper Lambda');
logger.level = 'debug';
// time recording module
const perfy = require('perfy');

const async = require('async');

const request = require('request');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const fs = require('fs');
const tar = require('tar');

const puppeteer = require ('puppeteer');
const config = require('./config');



exports.getBrowser = function() {
  return new Promise((resolve, reject) => {
      puppeteer.launch({
          headless: true,
          // executablePath: config.executablePath,
          args: config.launchOptionForLambda,
          // dumpio: !!exports.DEBUG,
      })
      .then((browser) => {
          resolve(browser);
      });
    });
};
