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

balanced.configure('ak-test-1P4LCuAfcv3isFlyX9mxNXvz6bI1XNril'); // test API key for Balanced Payments

var done = function(err, response){
  if(err) return err;
  console.log("hello")
  console.log(response);
};

var debitCard = function(appt, credit){
  console.log('apptObj', appt);
  var debitSubject = "You have made a payment to " + appt.merchant.userName;
  appt.description = debitSubject;
  payments.debitCustomer(appt, function(){
    credit(); // starts the credit callback
    var debitOptions = {
      subject: debitSubject,
      to: appt.customer.email,
      merchantUserName: appt.merchant.userName,
      duration: appt.duration,
      amount: (appt.payment.totalAmount / 100.0).toFixed(2)
    };
    console.log(done);
    mailer.sendDebitEmail(debitOptions, done);
  }); // callbacks in payments.debitCard
};

var creditCard = function(appt, done){
  console.log('apptObj', appt);
  var creditSubject = "You have received a payment from " + appt.customer.userName;
  appt.description = creditSubject;
  payments.creditAll(appt, function(){
    console.log("yo");
    var creditOptions = {
      subject: creditSubject,
      to: appt.merchant.email,
      customerUserName: appt.customer.userName,
      duration: appt.duration,
      amount: (appt.payment.merchantShare / 100.0).toFixed(2)
    };
    appt.payment.status = 'processed';
    appt.status = 'completed';
    appt.save();
    console.log(done);
    mailer.sendCreditEmail(creditOptions, done);
  });
};

exports.fetchCard = function(req, res) {
  var cardId = req.params.cardId;
  var cardHref = payments.cardUri(cardId);
  console.log('cardHref', cardHref);
  payments.fetchCard(cardHref, function(card) {
    res.jsonp(card);
  });
};

exports.deleteCard = function(req, res) {
  console.log('in delete card server side');
  var cardId = req.params.cardId;
  var cardHref = payments.cardUri(cardId);
  payments.deleteCard(cardHref, function(response) {
    console.log('delete card response', response);
    User.findOne({_id: req.user._id}, function(err, user) {
      user.balancedCard = "";
      user.balancedUser = "";
      user.save(function(err, user) {
        console.log('user after delete card', user);
        res.jsonp({ user: user, card: response });
      });
    });
  });
};

exports.fetchBank = function(req, res) {
  var bankId = req.params.bankId;
  var bankHref = payments.bankUri(bankId);
  payments.fetchBank(bankHref, function(response) {
    console.log('fetch bank response', response);
    res.jsonp(response);
  });
};

exports.deleteBank = function(req, res) {
  console.log('in delete bank server side');
  var bankId = req.params.bankId;
  var bankHref = payments.bankUri(bankId);
  payments.deleteBank(bankHref, function(response) {
    console.log('delete bank response', response);
    User.findOne({_id: req.user._id}, function(err, user) {
      user.balancedBank = "";
      user.save(function(err, user) {
        console.log('user after delete bank', user);
        res.jsonp({ user: user, bank: response });
      });
    });
  });
};


exports.transaction = function(req, res) {
  console.log('reqbody in trans', req.body);
  var amount = req.body.amount; // cents earned
  var duration = req.body.duration; // length of call

  console.log('req.body', req.body);
  Appointment.findById(req.body.sessionId).populate('customer').populate('merchant').exec(function(err, appt) {
    appt.payment = {
      customer: appt.customer._id,
      merchant: appt.merchant._id,
      totalAmount: amount,
      merchantShare: amount * 0.8,
      githelpShare: amount * 0.2,
      status: 'pending'
    };

    debitCard(appt, function(){
      creditCard(appt, done);
    });

    res.send(200);
  });
};

exports.createCard = function(req, res) {
  User.findOne({_id: req.user._id}, function(err, user) {
    var cardHref = payments.cardUri(req.body.balancedCard);
    payments.fetchCard(cardHref, function(card) {
      if(card.cvv_match !== 'yes'){
        res.send(400, "Wrong CVV Code");
        throw "Wrong CVV";
      }
      user.balancedCard = req.body.balancedCard;
      user.save();
      // balanced.get('/cards/'+user.balancedCard).associate_to_customer('/customers/'+user.balancedUser)
      //   .then(function(card){
      //     console.log('post associate', card);
          res.jsonp(user);
      //   }, function(err) {
      //     console.log(err);
      //     console.log('Could not associate customer to balancedUser');
      //   });
    });
  });
};

exports.createBank = function(req, res) {
  User.findOne({_id: req.user._id}, function(err, user) {
    user.balancedBank = req.body.balancedBank;
    user.save();
    // balanced.get('/bank_accounts/'+user.balancedBank).associate_to_customer('/customers/'+user.balancedUser)
    //   .then(function(account){
    //     console.log(account.toJSON());
        res.jsonp(user);
      // });
  });
};

exports.createBalanceUser = function(userObj, done) {
  balanced.marketplace.customers.create({
    "name": userObj.name,
    "email": userObj.fullName
  }).then(function(data){
    userObj.balancedUser = data.toJSON().id;
    userObj.save();
    done();
    // res.redirect('/')
  }, function(err) {
    console.log(err);
    console.log('unable to create BalanceUser');
    res.send(400, 'Unable to create BalanceUser');
  });
};

/*
https://docs.balancedpayments.com/1.0/overview/resources/#test-credit-card-numbers
https://docs.balancedpayments.com/1.1/api/bank-accounts/#create-a-bank-account-direct
https://dashboard.balancedpayments.com/#/marketplaces/TEST-MP1K2TEfmQCAvvy326vQ0MNE/logs/OHMb3897980c1e011e395cf06429171ffad
https://docs.balancedpayments.com/1.0/overview/fees/#funds-flow
https://docs.balancedpayments.com/1.0/overview/payouts/#submission-delivery-times
https://www.balancedpayments.com/flow
https://www.balancedpayments.com/payouts
*/
