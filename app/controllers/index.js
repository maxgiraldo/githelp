/**
 * Module dependencies.
 */

var search = require('../search');

var mongoose = require('mongoose'),
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
  search.query(req.body.queryInput).then(function(results) {
  //   var firstRepoUrl = results.items[0].full_name;
  //   var urlObj = search.extractUserAndRepo(firstRepoUrl);
  //   console.log('RESULTS ', firstRepo);
  //   search.getContributors(urlObj.user, urlObj.repo).then(function(topContribObj) {
  //     console.log('TOP OBJ', topContribObj);
  //     res.json(topContribObj.coreTeam);
  //   });

  // feeling lucky? get topContribs by first repo returned

    res.json(results.items);
  });






};
