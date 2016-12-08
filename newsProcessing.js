var request = require('request');
var cheerio = require("cheerio");
var config = require('./config');
var _ = require('lodash');

module.exports = {
    getLatestNewsNumber: function (fulfill, reject) {
        request({ uri: 'http://echosar.ru/news/' }, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                reject();
                return;
            }

            var $ = cheerio.load(body);
            var links = $('.news_block a:not(.more)').map(function () {
                return $(this).attr('href');
            }).get();

            var result = _.chain(links)
                .map(function (item) {
                    return parseInt(_.last(item.split(/_/)));
                })
                .max()
                .value();

            fulfill(result);
        });
    },
    getNewsUrls: function (latestNewsNumber) {
        var result = [];

        for (var i = 0; i < config.count; i++) {
            result[i] = ['http://echosar.ru/news/news_', latestNewsNumber - i, '.html'].join('');
        }

        return result;
    },
    processNewsUrl: function (url) {
        return new Promise(function (fulfill, reject) {
            var result = {
                url: url,
            };
            
            request({ uri: url }, function (error, response, body) {
                if (error || response.statusCode !== 200) {
                    fulfill(null);
                    return;
                }
                
                var $ = cheerio.load(body);
                
                result.header = $('h1').text().trim();
                
                var text = '';
                $('.nc_full_text span').each(function () {
                    text += $(this).text();
                });
                result.newsText = text.trim();
                
                result.dateTime = $('.nc_date').text().trim() + ' ' + $('.nc_time').text().trim();
                
                fulfill(result);
            });
        });
    },
    processResultNews: function (news) {
        console.log(news.filter(item => item));
    }
};