var request = require('request');
var cheerio = require("cheerio");
var config = require('./config');

var testUrl = 'http://echosar.ru/news/news_9836.html';

request({ uri: testUrl }, function (error, response, body) {
    if (error) {
        console.log(error);
        return
    }
    
    if (response.statusCode !== 200) {
        return;
    }
    
    var $ = cheerio.load(body);
    
    $('h1').each(function () {
        var link = $(this);
        console.log(link.text());
    });
    
    $('.nc_full_text span').each(function () {
        var link = $(this);
        console.log(link.text());
    });
    
    var date = $('.nc_date').text();
    console.log(date);
    
    var time = $('.nc_time').text();
    console.log(time);
});

