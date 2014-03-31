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
  // console.log('req', req);
  var amount = req.body.amount; // cents earned
  console.log('AMOUNT ', amount); // needs to be in cents
  var sessionId = req.body.sessionId;
  console.log('sessionId', sessionId);
  var duration = req.body.duration; // length of call
  Appointment.findById(sessionId, function(err, apptObj) {
    User.findById(apptObj.customer, function(err, customer) {
      User.findById(apptObj.merchant, function(err, merchant) {
        console.log('customer', customer.email);
        console.log('merchant', merchant.email);
        var description = "Payment for githelp from " + merchant.userName;
        var cardToken = customer.balancedUser; // fetch card obj with customer token;
        payments.debitCard(amount, description, cardToken); // callbacks in payments.debitCard

        // email to customer completed tx
        var htmlBodyCust = "Your call with " + merchant.userName +
        " lasted " + duration + " minutes " +
        "and you will be charged $" + (amount / 100.0).toFixed(2) +
        ". Thank you for using githelp!";
        mailer.sendEmail(htmlBodyCust, customer.email, 'Cost of completed githelp session');

        // email to merchant of completed tx
        var htmlBodyMerch = "Your call with " + customer.userName +
        " lasted " + duration + " minutes " +
        "and you will earn $" + (amount * 0.9 / 100.0).toFixed(2) +
        ". Thank you for using githelp!";
        mailer.sendEmail(htmlBodyMerch, merchant.email, 'Earnings from your completed githelp session');
        res.send(200);
      });
    });
  });
};

// var userName = 'wainetam'; // placeholder for now

exports.createCard = function(req, res) {
  console.log('in createCard');
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





