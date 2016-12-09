var newsProcessing = require('./newsProcessing');

new Promise(newsProcessing.getLatestNewsNumber)
.then(newsProcessing.getNewsUrls)
.then(urls => Promise.all(urls.map(newsProcessing.processNewsUrl)))
.then(newsProcessing.processResultNews)
.catch(function (error) {
    console.log(error);
});