// Module dependencies here
var mongoose = require('mongoose'),
    async = require('async'),
    Q = require('q'),
    balanced = require('balanced-official'),
    mailer = require('../api_builds/mailer'),
    payments = require('../api_builds/payments'),
    _ = require('underscore');
// Specific mongoose models defined here
var User = mongoose.model('User'),
    Appointment = mongoose.model('Appointment');

balanced.configure('ak-test-1dsNimzLa65kRDXzRzGgLQ5Gqoi8sIwCU'); // test API key for Balanced Payments

var done = function(err, response){
  if(err) return err;
  console.log(response);
};

var debitCard = function(appt, credit){
  var debitSubject = "You have made a payment to " + appt.merchant.userName;
  appt.description = debitSubject;
  payments.debitCard(appt, function(){
    credit(); // starts the credit callback
    var debitOptions = {
      subject: debitSubject,
      to: appt.customer.email,
      merchantUserName: appt.merchant.userName,
      duration: appt.duration,
      amount: (appt.payment.amount / 100.0).toFixed(2)
    };
    mailer.sendDebitEmail(debitOptions, done);
  }); // callbacks in payments.debitCard
};

var creditCard = function(appt, done){
  var creditSubject = "You have received a payment from " + appt.customer.userName;
  appt.description = creditSubject;
  payments.creditCard(appt, function(){
    var creditOptions = {
      subject: creditSubject,
      to: appt.merchant.email,
      customerUserName: appt.customer.userName,
      duration: appt.duration,
      amount: (appt.payment.amount * 0.9 / 100.0).toFixed(2)
    };

    mailer.sendCreditEmail(creditOptions, done);
  });
};

exports.transaction = function(req, res) {
  var amount = req.body.amount; // cents earned
  var duration = req.body.duration; // length of call

  Appointment.findById(req.body.sessionId).populate('customer').populate('merchant').exec(function(err, appt) {
    appt.payment = {
      customer: appt.customer._id,
      merchant: appt.merchant._id,
      amount: amount,
      status: 'pending'
    };
    appt.save();

    debitCard(appt, function(){
      creditCard(appt, done);
    });

    res.send(200);
  });
};

exports.createCard = function(req, res) {
  console.log('in createCard');
  var ccObj = req.body;
  var userName = ccObj.userName;
  // var userName = req.params.userName; // need userName to find in DB; assume to be in params for now
  console.log('userNameParams', userName);
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
  console.log(req);
  var bankObj = req.body;
  var userName = bankObj.userName;
  console.log('userNameParams', userName);
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





