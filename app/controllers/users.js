// Module dependencies here
var request = require('request');
var Q = require('q');
var async = require('async');
var mongoose = require('mongoose');
var balanced = require('balanced-official');
// Export Modified API functions
var search = require('../api_builds/search');
var scraper = require('../api_builds/scraper');
var scheduler = require('../api_builds/scheduler');
var payments = require('../api_builds/payments');
// Specific mongoose models defined here
var User = mongoose.model('User');
var Chatroom = mongoose.model('Chatroom');
var Appointment = mongoose.model('Appointment');

exports.updatePpm = function(req, res) {
  var ppm = req.query.ppm;
  var _id = req.query._id;
  User.findById(_id, function(err, user) {
    user.ppm = ppm;
    user.save();
  });
  res.send(200);
};

exports.updateEmail = function(req, res) {
  var email = req.body.address;
  var _id = req.body._id;
  User.findById(_id, function(err, user) {
    user.contactEmail = email;
    user.save();
    res.jsonp(user);
  });
};

exports.signin = function(req, res){
  // console.log('SIGN IN REDIRECT?');
  // res.set('content-type', 'text/javascript');
  res.render('signin');
  // res.redirect('/');
};

exports.clientSideAuth = function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
};

balanced.configure('ak-test-1P4LCuAfcv3isFlyX9mxNXvz6bI1XNril');

exports.authCallback = function(req, res, lastUrl) {
  console.log('in authCallback'); // create Balanced acct after auth
  if(req.user.contactEmail) {
    if(lastUrl){
      res.redirect('#!/' + lastUrl);
    } else{
      res.redirect('/');
    }
  } else {
    res.redirect('#!/' + req.user.userName + '/emailrequired');
  }

  // if(req.user.contactEmail) {
  //   payments.createBalanceUser(req.user, function() {
  //     console.log('created Balance User');
  //     if(lastUrl){
  //       res.redirect('#!/' + lastUrl);
  //     } else{
  //       res.redirect('/');
  //     }
  //   });
  // } else {
  //   res.redirect('#!/' + req.user.userName + '/emailrequired');
  // }
};

//   if(req.user.balancedUser){
//       if(lastUrl){
//         res.redirect('#!/'+lastUrl);
//       }else{
//         res.redirect('/');
//       }
//   } else if (req.user.email && req.user.fullName) {
//     balanced.marketplace.customers.create({
//       "name": req.user.fullName,
//       "email": req.user.email
//     }).then(function(data){
//       req.user.balancedUser = data.toJSON().id; // does this actually save in DB -- need to test
//       req.user.save();
//       res.redirect('/');
//     });
//   } else {
//     if(lastUrl){
//         res.redirect('#!/'+lastUrl);
//     }else{
//       res.redirect('/');
//     }
//   };
// };

//   console.log('in authCallback');
//   if(req.user.balancedUser){
//       if(lastUrl){
//         res.redirect('#!/'+lastUrl);
//       }else{
//         res.redirect('/');
//       }
//   } else{
//     balanced.marketplace.customers.create({
//       "name": req.user.fullName,
//       "email": req.user.email
//     }).then(function(data){
//       req.user.balancedUser = data.toJSON().id;
//       req.user.save();
//       res.redirect('/');
//     });
//   }
// };


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
      Chatroom.find({members: req.user._id}).populate('members').exec(function(err, chatrooms){
        callback(null, chatrooms);
      });
    },
    three: function(callback){
      Appointment.find({merchant: req.user._id}).populate('merchant').populate('customer').exec(function(err, appointments){
        callback(null, appointments);
      });
    },
    four: function(callback){
      Appointment.find({customer: req.user._id}).populate('customer').populate('merchant').exec(function(err, appointments){
        callback(null, appointments);
      });
    }
  }, function(err, results){
    var objectString = JSON.stringify({
      'allUsers': results.one,
      'inboxes': results.two,
      'merchantAppointments': results.three,
      'customerAppointments': results.four
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



