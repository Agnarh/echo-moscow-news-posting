var request = require('request');
var cheerio = require("cheerio");
var config = require('./config');
var siteSettings = config.siteSettings;
var _ = require('lodash');

var newsUrlTemplateFunc = _.template(siteSettings.newsUrlTemplate);

module.exports = {
    getLatestNewsNumber: function (fulfill, reject) {
        request({ uri: siteSettings.urlToNewsFolder }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                reject(error);
                return;
            }

            var $ = cheerio.load(body);
            var numbers = $(siteSettings.newsRefsSelector)
                .map(function () { return $(this).attr('href'); })
                .get()
                .map(item => +item.match(siteSettings.newsUrlNumberExtractRegex)[0]);

            fulfill(_.max(numbers));
        });
    },
    getNewsUrls: function (latestNewsNumber) {
        return _.range(latestNewsNumber, latestNewsNumber - config.count, -1)
            .map(index => newsUrlTemplateFunc({index}));
    },
    processNewsUrl: function (url) {
        return new Promise(function (fulfill, reject) {
            request({ uri: url }, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    fulfill(null);
                    return;
                }

                var result = { url: url };
                var $ = cheerio.load(body);

                result.title = $(siteSettings.newsTitleSelector).text().trim();

                result.text = $(siteSettings.newsTextSelector)
                    .map(function () { return $(this).text(); })
                    .get()
                    .reduce(function (result, paragraph) { 
                        result += paragraph; 
                        return result; 
                    }, '')
                    .trim();

                result.pubDate = [siteSettings.newsDateSelector, siteSettings.newsTimeSelector]
                    .map(item => $(item).text().trim())
                    .join(' ');

                fulfill(result);
            });
        });
    },
    processResultNews: news => news.filter(item => item)
};