/**
 * Module dependencies.
 */

var payments = require('../api_builds/payments');

var mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
  User = mongoose.model('User'),
  async = require('async'),
  Q = require('q'),
  _ = require('underscore');

exports.createCard = function(req, res) {
  var cc = req.body;
  var userName = 'wainetam'; // placeholder for now
  // var userName = 'req.params.userName' // need userName to find in DB; assume to be in params for now
  console.log('CC', cc);
  payments.createCreditCard(cc).then(function(card) {
    console.log('CARD', card.toJSON());
    User.findOneAndUpdate({ userName: userName }, { balancedCard: card.id }, {}, function(err, user) {
      if(err) { console.log(err); }
      console.log('Updated creditcard info to: ', user);
      res.jsonp(user);
    });
  }, function(err) {
    console.log(err);
  });
};
