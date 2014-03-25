/**
 * Module dependencies.
 */

var search = require('../api_builds/search');

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  Q = require('q'),
  _ = require('underscore');


exports.render = function(req, res) {
  res.render('index', {
      user: req.user || null
  });
};

exports.results = function(req, res) {
  console.log('BODY', req.body);
  // var data = search.userStats(req.body.queryInput);
  search.query(req.body.queryInput, false, false).then(function(results) {
    console.log("hey ji ho was here")
    console.log(results);
  //   var firstRepoUrl = results.items[0].full_name;
  //   var urlObj = search.extractUserAndRepo(firstRepoUrl);
  //   console.log('RESULTS ', firstRepo);
  //   search.getContributors(urlObj.user, urlObj.repo).then(function(topContribObj) {
  //     console.log('TOP OBJ', topContribObj);
  //     res.json(topContribObj.coreTeam);
  //   });

  // feeling lucky? get topContribs by first repo returned

    // res.json(results.items); // for general query results

    // res.json(results.coreTeam); // for repoBool true & want coreTeam
    // res.json(results.otherTop); // for repoBool true & want otherTop

    // res.json(results); // for repoBool true & want otherTop

    User.find({userName: req.body.queryInput}, function(err, users){
      var response = {
        githubResults: results.items,
        githelpResults: users
      };
      res.jsonp(response);
    })

  })






};
