// Module dependencies here
var mongoose = require('mongoose'),
    async = require('async'),
    Q = require('q'),
    balanced = require('balanced-official'),
    mailer = require('../api_builds/mailer'),
    payments = require('../api_builds/payments'),
    _ = require('underscore');
// Specific mongoose models defined here
var Payment = mongoose.model('Payment'),
    User = mongoose.model('User'),
    Appointment = mongoose.model('Appointment');

balanced.configure('ak-test-1dsNimzLa65kRDXzRzGgLQ5Gqoi8sIwCU'); // test API key for Balanced Payments

// exports.createCard = function(req, res) {
//   var ccObj = req.body;
//   var userName = 'wainetam'; // placeholder for now
//   // var userName = 'req.params.userName' // need userName to find in DB; assume to be in params for now
//   console.log('CC', ccObj);
//   payments.createCreditCard(ccObj).then(function(card) {
//     console.log('CARD', card.toJSON());
//     User.findOneAndUpdate({ userName: userName }, { balancedCard: card.id }, {}, function(err, user) {
//       if(err) { console.log(err); }
//       console.log('Updated creditcard info to: ', user);
//       res.jsonp(user);
//     });
//   }, function(err) {
//     console.log(err);
//   });
// };

// sending amount, description, and appointmentId

exports.debitCard = function(req, res) {
  console.log('req', req);
  var amount = req.body.amount;
  console.log('AMOUNT ', amount); // needs to be in cents
  var appointmentId = req.body.appointmentId;

  Appointment.findById(appointmentId, function(err, apptObj) {
    User.findById(apptObj.customer, function(err, customer) {
      User.findById(apptObj.merchant, function(err, merchant) {
        var description = "Payment for githelp from " + merchant.userName;
        var cardToken = customer.balancedCard; // fetch card obj with customer token;
        payments.debitCard(amount, description, cardToken); // write callbacks
      });
    });
  });
};

var userName = 'wainetam'; // placeholder for now

exports.createCard = function(req, res) {
  console.log('RES', res);
  var ccObj = req.body;
  // var userName = 'req.params.userName' // need userName to find in DB; assume to be in params for now
  console.log('CC', ccObj);
  balanced.marketplace.cards.create(ccObj)
    .then(function(card) {
      console.log('CARD ', card.toJSON());
      User.findOneAndUpdate({ userName: userName }, { balancedCard: card.id }, {}, function(err, user) {
        if(err) { console.log(err); }
        console.log('Updated creditcard info to: ', user);
        res.jsonp(user);
      });
    }, function(err) {
    console.log(err);
  });
};

exports.createBankAcct = function(req, res) {
  var bankObj = req.body;
  console.log('BA', bankObj);
  balanced.marketplace.bank_accounts.create(bankObj)
    .then(function(account) {
      console.log('BANK ', account.toJSON());
      User.findOneAndUpdate({ userName: userName }, { balancedBank: account.id }, {}, function(err, user) {
        if(err) { console.log(err); }
        console.log('Updated bank acct info to: ', user);
        res.jsonp(user);
      });
    }, function(err) {
    console.log(err);
  });
};

exports.deleteCard = function(req, res) {

};

exports.updateCard = function(req, res) {

};

exports.updateBankAcct = function(req, res) {

};





