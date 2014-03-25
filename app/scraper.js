var cheerio = require('cheerio'),
    zombie = require('zombie');

var url = 'https://github.com/dhh';

var zombieCrawl = function(url) {
  zombie.visit(url, function (err, browser, status) {

    console.log(browser.html());

    $ = cheerio.load(browser.html());
    var contribItems = $('.repo-list-item');
    // var price = browser.document.getElementById('priceblock_ourprice').innerHTML;
    console.log('contribItems ', contribItems);
  });
};

zombieCrawl(url);
