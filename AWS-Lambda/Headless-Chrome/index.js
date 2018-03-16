const LOG4JS = require('../node_modules/log4js');
let logger = LOG4JS.getLogger('NemoSiteScraper Lambda');
logger.level = 'debug';
// time recording module
const perfy = require('perfy');

const async = require('async');

const request = require('../node_modules/request');

const AWS = require('../node_modules/aws-sdk');
const s3 = new AWS.S3();

const setup = require('./setup/setup')

const jsdom = require('jsdom')
const { JSDOM } = jsdom;


exports.handler = function (event, context, callback)  {
    // For keeping the browser launch
    context.callbackWaitsForEmptyEventLoop = false;
    if (event == null) {
          context.fail('Nothing passed in!');
    } else if (!event.subject || !event.scrapingRules) {
          context.fail('No URL or no tests to run included with event!');
    } else {
          let resultsObject = { subject: event.subject };
          resultsObject.subject.url = decodeURIComponent(resultsObject.subject.url);

          let fixedURL = resultsObject.subject.url;;
          logger.debug('USING URL: ',resultsObject.subject.url);

          if (!fixedURL.includes('http')) fixedURL = 'http://'+fixedURL;

          setup.getBrowser().then((browser) => {
              run(browser, fixedURL, resultsObject).then((result) => {
                  let resultArray = [result, browser]
                  context.succeed(resultArray)}
              ).catch(
                  (err) => context.fail('Web Scraping Failed')
              );
          });
    };
};


let run = function (browser, url, resultsObject) {
    return new Promise((resolve, reject) => {
        browser.newPage().then((page) => {
            page.goto(url).then((response) => {
                if (response._status > 301) {
                    resultsObject.errors = [response._status];
                    return resultsObject;
                } else if (!response._headers['content-type'].toLowerCase().includes('text/html')) {
                    resultsObject.errors = [`Not an HTML page, is ${response._headers['content-type']}`];
                    return resultsObject;
                } else {
                    return page;
                }
            }).then((result) => {
                resolve(result);
            })
        });
    });
};
