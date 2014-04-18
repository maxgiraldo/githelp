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
  var debitSubject = "You have made a payment to " + appt.merchant.userName;
  appt.description = debitSubject;
  payments.debitCustomer(appt, function(){
    credit(); // starts the credit callback
    var debitOptions = {
      subject: debitSubject,
      to: appt.customer.email,
      merchantUserName: appt.merchant.userName,
      duration: appt.duration,
      amount: (appt.payment.amount / 100.0).toFixed(2)
    };
    console.log(done);
    mailer.sendDebitEmail(debitOptions, done);
  }); // callbacks in payments.debitCard
};

var creditCard = function(appt, done){
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
    appt.status = 'completed',
    appt.save();
    console.log(done);
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
  console.log('in createCard');
  var ccObj = req.body;
  var userName = ccObj.userName;
  // var userName = req.params.userName; // need userName to find in DB; assume to be in params for now
  console.log('userNameParams', userName);
  console.log('CC', ccObj);
  balanced.marketplace.cards.create(ccObj)
    .then(function(card) {
      req.user.balancedCard = card.toJSON().id;
      balanced.get('/cards/'+req.user.balancedCard).associate_to_customer('/customers/'+req.user.balancedUser)
      .then(function(card){
        console.log(card);
      })
      req.user.save();
      res.jsonp(req.user);
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
      console.log(account.toJSON());
      req.user.balancedBank = account.toJSON().id;
      console.log(req.user.balancedBank);
      balanced.get('/bank_accounts/'+req.user.balancedBank).associate_to_customer('/customers/'+req.user.balancedUser)
      .then(function(bankAccount){
        console.log(bankAccount.toJSON());
      })
      req.user.save();
      res.jsonp(req.user);
    }, function(err) {
    console.log(err);
  });
};

exports.createBalanceUser = function(userObj, done) {
  // if(userObj.email && userObj.fullName) {
  balanced.marketplace.customers.create({
    "name": userObj.name,
    "email": userObj.fullName
  }).then(function(data){
    userObj.balancedUser = data.toJSON().id;
    userObj.save();
    done();
    // res.redirect('/')
  });
};

// done() === function() {

// }

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
//       req.user.balancedUser = data.toJSON().id;
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
// }

exports.deleteCard = function(req, res) {

};

exports.updateCard = function(req, res) {

};

exports.updateBankAcct = function(req, res) {

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
