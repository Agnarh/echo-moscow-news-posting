var request = require('request');
var cheerio = require("cheerio");
var dateFormat = require('dateformat');
var config = require('../config');
var siteSettings = config.siteSettings;
var _ = require('lodash');

var newsUrlTemplateFunc = _.template(siteSettings.newsUrlTemplate);

function processDateTime(dateStr, timeStr) {
    if (!(dateStr || timeStr)) {
        return '';
    }
    
    var dateTokens = dateStr.split('.'),
        timeTokens = timeStr.split(':'),
        date = new Date(+dateTokens[2], +dateTokens[1] - 1, +dateTokens[0], +timeTokens[0], +timeTokens[1]);
    
    return dateFormat(date, 'ddd, d mmm yyyy HH:MM:ss') + ' +0400';
}

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

                var $ = cheerio.load(body);
                var title = $(siteSettings.newsTitleSelector).text().trim();
                var text = $(siteSettings.newsTextSelector)
                    .map(function () { return $(this).text(); })
                    .get()
                    .reduce(function (result, paragraph) { 
                        result += paragraph.trim(); 
                        return result; 
                    }, '')
                    .trim();

                var dateStr = $(siteSettings.newsDateSelector).text().trim();
                var timeStr = $(siteSettings.newsTimeSelector).text().trim();
                var pubDate = processDateTime(dateStr, timeStr);

                if (title && text && pubDate) {
                    fulfill({ 
                        url, 
                        title: _.unescape(title), 
                        text: _.unescape(text), 
                        pubDate
                    });
                } else {
                    fulfill(null);
                }           
            });
        });
    },
    processResultNews: news => news.filter(item => item)
};