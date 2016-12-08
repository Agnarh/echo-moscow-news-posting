var request = require('request');
var cheerio = require("cheerio");
var config = require('./config');
var _ = require('lodash');

var testUrl = 'http://echosar.ru/news/news_9836.html';

function processUrl(url, callback) {
    var result = {
        url: url,
        error: false
    };
    
    request({ uri: url }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            result.error = true;
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
        
        callback(result);
    });
}

function getlatestNewsNumber(callback) {
    var result = null;
    
    request({ uri: 'http://echosar.ru/news/' }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            result = false;
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
        
        console.log('Done aquiring the number of the latest news!');
        callback(result);
    });
}

function getUrls(count, callback) {
    getlatestNewsNumber(function (latestNewsNumber) {
        console.log('Creating news urls...');
        var result = [];
    
        for (var i = 0; i < count; i++) {
            result[i] = ['http://echosar.ru/news/news_', latestNewsNumber - i, '.html'].join('');
        }
        
        console.log('Done creating news urls!');
        callback(result);
    });
}

function processNews(count, callback) {
    getUrls(count, function (urls) {
        console.log('Processing news urls...');
        var news = [];
    
        urls.forEach(function (url) {
            processUrl(url, function (result) {
                news.push(result);
            });
        });
        
        var id = setInterval(function () {
            if (news.filter(item => item).length === count) {
                clearInterval(id);
                console.log('Done processing of news urls!');
                callback(_.sortBy(news, 'url'));
            }
        }, 1000);
    });
}

console.log('Aquiring the number of the latest news...');
processNews(5, function (news) {
    console.log('Done!');
    // console.log(news);
});