var newsProcessing = require('./newsProcessing');
var rssProcessing = require('./rssProcessing');

new Promise(newsProcessing.getLatestNewsNumber)
    .then(newsProcessing.getNewsUrls)
    .then(urls => Promise.all(urls.map(newsProcessing.processNewsUrl)))
    .then(newsProcessing.processResultNews)
    .then(rssProcessing.generateXMLString)
    .then(function (xml) {
        // console.log(xml);
    })
    .catch(function (error) {
        console.log(error);
    });