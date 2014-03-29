// Module dependencies here
var request = require('request');
var search = require('../api_builds/search');
var scraper = require('../api_builds/scraper');
var scheduler = require('../api_builds/scheduler');
var payments = require('../api_builds/payments');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var User = mongoose.model('User');
var Chatroom = mongoose.model('Chatroom');
var Q = require('q');
var async = require('async');

exports.signin = function(req, res){
  res.render('signin');
};

exports.authCallback = function(req, res) {
  res.redirect('/');
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
  res.render('signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

exports.profile = function(req, res){
  // async.parallel
  var userName = req.params.userName;
  async.parallel({
    one: function(callback){
      var start = new Date().getTime();
      scraper.getTopContribs('https://github.com/'+userName).then(function(contribs){
        console.log('one');
        var end = new Date().getTime();
        console.log(start - end);
        callback(null, contribs);
      });
    },
    two: function(callback){
      var start = new Date().getTime();
      search.userStats(userName).then(function(data){
        console.log('two');
        var end = new Date().getTime();
        console.log(start - end);
        callback(null, data);
      });
    },
    three: function(callback){
      var start = new Date().getTime();
      User.findOne({userName: req.params.userName}, function(err, user){
        console.log('three');
        var end = new Date().getTime();
        console.log(start - end);
        callback(null, user);
      });
    }
  },
  function(err, results){
    var response = {
      repoList: results.two,
      user: results.three,
      conList: results.one
    };
    res.jsonp(response);
  });
};

exports.edit = function(req, res){
  async.parallel({
    one: function(callback){
      User.findOne({_id: req.user._id}, function(err, user){
        user.ppm = req.body.ppm;
        user.intro = req.body.intro;
        user.save(function(err, user){
          callback(user);
        })
      })
    },
    two: function(callback){
      // payments.updateCard()
      callback("hello");
    }
  },
  function(err, results){
    res.jsonp(results);
  });
};

exports.findAll = function(req, res){
  async.parallel({
    one: function(callback){
      User.find(function(err, users){
        callback(null, users);
      });
    },
    two: function(callback){
      Chatroom.find({members: req.user._id}).exec(function(err, chatrooms){
        callback(null, chatrooms);
      });
    }
  },
  function(err, results){
    var objectString = JSON.stringify({
      'allUsers': results.one,
      'inboxes': results.two
    });
    var response = [];
    response[0] = objectString;
    res.jsonp(response);
  });
};

/**
 * Repo
 */

exports.repoData = function(req, res) {
  search.getContributors(req.params.userName, req.params.repoName).then(function(contributorsObj) {
    res.jsonp(contributorsObj);
  });
};



