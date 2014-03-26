// Module dependencies here
var request = require('request');
var search = require('../api_builds/search');
var scraper = require('../api_builds/scraper');
var mongoose = require('mongoose');
// Specific mongoose models defined here
var User = mongoose.model('User');
var Q = require('q');

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
  console.log("hello")
  var userName = req.params.userName;
  search.userStats(userName).then(function(data){
    scraper.getTopContribs('https://github.com/'+userName).then(function(contribs){
      console.log(contribs);
      User.findOne({userName: req.params.userName}, function(err, user){
        var response = {
          repoList: data,
          conList: contribs,
          user: user
        };
        console.log(user);
        res.jsonp(response);
      })
    })
  })
}