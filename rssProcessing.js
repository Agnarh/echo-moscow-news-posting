var config = require('./config');
var rssSettings = config.rssSettings;
var ftpSettings = config.ftpSettings;
var rssTemplate = require('./' + rssSettings.rssTemplateName);
var _ = require('lodash');

var templateFunc = _.template(rssTemplate);

module.exports = {
    generateXMLString: news => templateFunc({ news })
}