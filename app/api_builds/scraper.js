var cheerio = require('cheerio'),
    request = require('request'),
    search = require('./search'),
    Q = require('q');

var url = "https://github.com/dhh";

// returns array of topContributed Repos
exports.getTopContribs = function(url) {

  var deferred = Q.defer();

  request(url, function(err, response, body) { // request takes an object w parameters: method, uri
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
      consoled.log('HREF MATCH ', href.match(regex));
      console.log('REGEX', regex);
      if(href.match(regex) === null) {
        console.log('topContribs ', topContribs);
        topContribs.push(href);
      }
    });

    console.log('hrefs ', hrefs);
    console.log('topContribs ', topContribs);
    deferred.resolve(topContribs);
  });

  return deferred.promise;
};
