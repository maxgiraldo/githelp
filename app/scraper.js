var cheerio = require('cheerio'),
    request = require('request'),
    search = require('./search');

var url = "https://github.com/dhh";

exports.getTopContribs = function(url) {

  var page = request(url, function(err, response, body) { // request takes an object w parameters: method, uri
    if(err && response.statusCode !== 200) {
      console.log('Request error.');
    }

    $ = cheerio.load(response.body);
    console.log(response.body);

    var username = search.processUserUrl(url).user;
    // var username = 'dhh';
    var topContribs = [];

    var linkObj = $('.repo-list-item');
    var hrefs = [];

    for(var i = 0; i < linkObj.length; i++) {
      hrefs.push(linkObj[i].attribs.href);
    }

    hrefs.forEach(function(href) {
      var regex = new RegExp(username);
      console.log('HREF MATCH ', href.match(regex));
      console.log('REGEX', regex);
      if(href.match(regex) === null) {
        console.log('topContribs ', topContribs);
        topContribs.push(href);
      }
    });

    console.log('hrefs ', hrefs);
    console.log('topContribs ', topContribs);
    return topContribs;

  });
};

exports.getTopContribs(url); // returns array of topContributed Repos