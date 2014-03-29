// Module dependencies here
var request = require('request');
var search = require('../api_builds/search');
var scraper = require('../api_builds/scraper');
var scheduler = require('../api_builds/scheduler');
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
  search.userStats(userName).then(function(data){
    scraper.getTopContribs('https://github.com/'+userName).then(function(contribs){
      User.findOne({userName: req.params.userName}, function(err, user){
        var response = {
          repoList: data,
          conList: contribs,
          user: user
        };
        res.jsonp(response);
      })
    })
  })
}

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
    })
    var response = []
    response[0] = objectString
    res.jsonp(response);
  })
};





