this.getPackageFromS3ToStream = function(keys, returnCount) {

    return new Promise((resolve, reject) => {
        let s3stream, lineStream, dataResult, totalCount;
        let clientArr = [];
        let resultArr = [];
        let count = 0;
        //get the package for each key inside s3
        async.each(keys, (key, nextKey) => {

            let s3Params = {
                Bucket: 'wheelhouse-sonar',
                Key: key.Key
            };

            s3stream = s3.getObject(s3Params).createReadStream().pipe(zlib.createGunzip());
            lineStream = BYLINE(s3stream);
            lineStream.on('data', line => {

                let clientIdStream = line.toString().split(',')[1];
                let objectIdStream = line.toString().split(',')[0];
                let urlStream = line.toString().split(',')[2];

                if (!clientArr.includes(clientIdStream)) {
                    clientArr.push(clientIdStream);
                    resultArr.push(
                        {
                            urls: [],
                            clientId: clientIdStream
                        });
                } else{
                    resultArr.forEach(result => {
                        if(result.clientId === clientIdStream && urlStream !== 'marinsm.com' && urlStream.split('.com').length <= 2) {
                            result.urls.push(
                                {
                                    objectId: objectIdStream,
                                    objectFrom: 'database/keyword',
                                    url: urlStream
                                });
                            //Counting for every urls pushed
                            count += 1;
                        };
                    });
                };

            })

            lineStream.on('error', err => {
                logger.error(err);
            })

            lineStream.on('end', () => {
                nextKey();
            })

        }, err => {
            if (err) logger.error(err);
            else {
                //Counting the number of URLS in the result
                totalCount = resultArr[0].urls.length

                async.each(clientArr, (client, nextClient) =>{

                    let body;
                    let todaysDate = moment().format("YYYY-MM-DD")

                    resultArr.forEach(result => {
                        if (result.clientId === client) {
                            body = JSON.stringify(result);
                        }
                    })

                    let s3ParamsSave = {
                        Bucket: 'wheelhouse-sonar',
                        Key: `dev_nemo/new-packages/${client}_${todaysDate}.json`,
                        Body: body
                    };

                    s3.upload(s3ParamsSave, function(err, data) {
                        if (err) logger.debug(err);
                        else {
                            //getting the data result, so it can be resolved. Push the data into dataResult if there are multiples object result
                            dataResult = data;
                            nextClient();
                        };
                    });
                }, err => {
                    if (err) logger.error(err);
                    else {
                      if (returnCount) {
                          resolve([count, totalCount])
                      }
                      else {
                          resolve(dataResult);
                      };
                    };
                });
            };
        });
    });
};
