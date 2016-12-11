var fs = require('fs');
var Client = require('ftp');
var iconv = require('iconv-lite');
var config = require('../config');
var rssSettings = config.rssSettings;
var ftpSettings = config.ftpSettings;
var rssTemplate = require('../' + rssSettings.rssTemplateName);
var _ = require('lodash');

var templateFunc = _.template(rssTemplate);

module.exports = {
    generateXMLString: news => templateFunc({ news }),
    writeRssFile: function (xmlString) {
        return new Promise(function (fulfill, reject) {
            var buffer = iconv.encode(xmlString, 'win1251');
            
            fs.writeFile(rssSettings.rssFileName, buffer, function (error) {
                if (error) {
                    reject(error);
                    return;
                }

                fulfill();
            });
        });
    },
    sendRSSFile: function () {
        return new Promise(function (fulfill, reject) {
            var client = new Client();
            
            client.on('ready', function () {
                client.put(rssSettings.rssFileName, rssSettings.rssDestFilePath, function (error) {
                    if (error) {
                        client.destroy();
                        reject(error);
                        return;
                    }
                    
                    client.end();
                    fulfill();
                });
            });
            
            client.connect({
                host: ftpSettings.serverIP,
                user: ftpSettings.login,
                password: ftpSettings.password
            });
        });
    }
}