var newsProcessing = require('./modules/newsProcessing');
var rssProcessing = require('./modules/rssProcessing');

new Promise(newsProcessing.getLatestNewsNumber)
    .then(newsProcessing.getNewsUrls)
    .then(urls => Promise.all(urls.map(newsProcessing.processNewsUrl)))
    .then(newsProcessing.processResultNews)
    .then(rssProcessing.generateXMLString)
    .then(rssProcessing.writeRssFile)
    .then(rssProcessing.sendRSSFile)
    .then(function () {
        console.log('RSS.xml file successfully sent!');
    })
    .catch(function (error) {
        console.log(error.message);
    });