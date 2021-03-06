var balanced = require('balanced-official'),
    Q = require('q'),
    async = require('async');

balanced.configure('ak-test-1P4LCuAfcv3isFlyX9mxNXvz6bI1XNril');

// var customer = balanced.marketplace.customers.create();

// console.log('CUSTOMER ', customer);

var cardFormObj = {
  'number': '4111111111111111',
  'expiration_year': '2016',
  'expiration_month': '12',
  'cvv': '123',
  'address': {
    'line1': '965 Mission St',
    'line2': '',
    'city': '',
    'state': '',
    // 'country_code': '',
    'postal_code': '94103' // need to add address and postal code for card.avs_postal_match === 'yes'
  }
};

var bankFormObj = {
  'routing_number': '121000358',
  'account_type': 'checking',
  'name': 'Johann Bernoulli',
  'account_number': '9900000001'
};

// exports.createCard = function(cardFormObj) {
//   balanced.marketplace.cards.create(cardFormObj)
//   .then(function(card) {
//     console.log('CARD ', card.toJSON());
//   }, function(err) {
//     console.log('err in create card', err);
//   });
// };

exports.fetchCard = function(cardHref, done) {
  balanced.get(cardHref)
  .then(function(card) {
    console.log('CARD ', card);
    done(null, card);
  }, function(err) {
    console.log('err in fetch card', err);
    done(err);
  });
};

exports.fetchBank = function(bankHref, done) {
  balanced.get(bankHref)
  .then(function(bank) {
    console.log('BANK ', bank);
    done(null, bank);
  }, function(err) {
    console.log('err in fetch bank', err);
    done(err);
  });
};

// exports.createCard(cardFormObj);

// exports.createBankAccount = function(bankFormObj) {
//   balanced.marketplace.bank_accounts.create(bankFormObj)
//   .then(function(account) {
//     console.log('ACCOUNT ', account.toJSON());
//   }, function(err) {
//     console.log('err in create bank', err);
//   });
// };

// exports.createBankAccount(bankFormObj);

// 965 Mission St  94103 AVS street matches

// or balanced.get(cardURI).debit()

var associateCardToCustomer = function(cardObj, customerObj) {
  var deferred = Q.defer();
  balanced.get(cardObj.href).associate_to_customer(customerObj.href).then(function(obj) {
    deferred.resolve(obj);
  }, function(err) {
    // console.log(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

// var debitCard = function(amount, cardObj, customerObj) { // amount in cents
//   associateCardToCustomer(cardObj, customerObj).debit({
//       'amount': amount,
//       'appears_on_statement_as': 'githelp.co',
//       'description': 'githelp.co'
//     }).then(function (debit) {
//         // save the result of the debit
//       // console.log('debit', debit.toJSON());
//       // console.log('card', debit._api.objects);
//     }, function (err) {
//         // record the error message
//       // console.log(err);
//     });
// };

exports.cardUri = function(cardToken) {
  var uri = '/cards/' + cardToken;
  console.log('cardToken ', cardToken);
  console.log('uri ', uri);
  return uri;
};

exports.bankUri = function(bankToken) {
  var uri = '/bank_accounts/' + bankToken;
  return uri;
};

exports.debitCustomer = function(appt, done) {
  console.log("in the debit")
  var cardUriStr = exports.cardUri(appt.customer.balancedCard);
  balanced.get(cardUriStr).debit({
    'amount': parseInt(appt.payment.totalAmount),
    'appears_on_statement_as': 'githelp.co',
    'description': appt.description
  }).then(function(debit) {
    console.log('debit completed', debit.toJSON());
    done();
    // maybe over here i should take some data from the debit
  }, function(err) {
    console.log(err);
  });
};

exports.creditAll = function(appt, done) {
  async.parallel({
    one: function(callback){
      console.log("in the merchant credit")
      var bankUriStr = exports.bankUri(appt.merchant.balancedBank);
      balanced.get(bankUriStr).credit({
        'amount': parseInt(appt.payment.merchantShare),
        'appears_on_statement_as': 'githelp.co',
        'description': appt.description
      }).then(function(credit) {
        console.log('credit completed', credit.toJSON());
        callback(null, credit.toJSON());
      }, function(err) {
        console.log("hello")
        console.log(err);
      });
    },
    // paying out to marketplace
    two: function(callback){
      console.log("in the githelp credit")
      var bankUriStr = exports.bankUri('BA1KizFhYIy8FZgCcHT360nQ');
      balanced.get(bankUriStr).credit({
        'amount': parseInt(appt.payment.githelpShare),
        'appears_on_statement_as': 'githelp.co',
        'description': appt.description
      }).then(function(credit) {
        console.log('credit completed', credit.toJSON());
        callback(null, credit.toJSON())
      }, function(err) {
        console.log("goodbye")
        console.log(err);
      });
    }
  }, function(err, results){
    if(err) console.log(err);
    console.log("creditAll results", results);
    done();
  })
}

exports.updateCard = function(currentCardObj, updatedCardObj) {
  var updatedParams = ""; // dummyVar for now
  balanced.get(currentCardObj.href).then(function(card) {
    // console.log('Updated card:', card);
    card.address = {}; // dummy for now
    card.save();
  });
};

exports.deleteCard = function(cardHref, done) {
  console.log('in balanced func delete card');
  balanced.get(cardHref).then(function(card) {
    return card.unstore().then(function() {
      return balanced.get(cardHref).then(function(card) { // returns deleted card
        console.log('Deleted card:', card);
        done(card);
      });
    });
  });
};

exports.deleteBank = function(bankHref, done) {
  console.log('in balanced func delete bank');
  balanced.get(bankHref).then(function(bank) {
    return bank.unstore().then(function() {
      return balanced.get(bankHref).then(function(bank) { // returns deleted bank
        console.log('Deleted bank:', bank);
        done(bank);
      });
    });
  });
};

exports.updateBankAcct = function(bankObj, updatedBankObj) {
  var updatedParams = ""; // dummyVar for now
  balanced.get(bankObj.href).then(function(bankAcct) {
    // console.log('Deleted bank acct:', bankAcct);
    bankAcct.address = {};
    bankAcct.save();
  });
};


// initiates verification process for bank account
exports.verifyBankAcct = function(bankObj) {
  balanced.get(bankObj.href).verify().then(function(status) {
    // console.log('Status of acct to be verified:', status);
  });
};

// confirm verification process
exports.confirmBankAcct = function(amt1, amt2, bankObj) {
  balanced.get(bankObj.href).confirm(amt1, amt2).then(function(status) {
    // console.log('Status of acct to be confirmed:', status);
  });
};

// exports.deleteBankAcct = function(bankObj) {
//   balanced.get(bankObj.href).unstore().then(function(bankAcct) {
//     // console.log('Deleted bank acct:', bankAcct);
//   });
// };


var customerObj = balanced.marketplace.customers.create({
  'uri': '/customers',
  'payload': {
    'address': {
      'postal_code': '48120'
  },
    'name': 'Henry Ford',
    'dob_year': 1963,
    'dob_month': 7
  }
});

// balanced.marketplace.customers.create({
//     'name': 'Henry Ford',
//     'dob_year': 1985,
//     'dob_month': 7,
//     'address': {
//       'postal_code': '48120' // need to add address and DOB for customer.merchant_status='underwritten'
//     }
//   }).then(function(customer) {
//     // console.log('CUSTOMER', customer.toJSON());
//   }, function(err) {
//     // console.log(err);
//   });

// balanced.marketplace.cards.create(cardFormObj).debit({
//     'amount': 5000,
//     'appears_on_statement_as': 'githelp.co',
//     'description': 'githelp.co'
//   }).then(function(debit) {
//     // console.log('debit', debit.toJSON());
//   }, function(err) {
//     // console.log(err);
//   });

// var creditBankAccount = function(amount, bankObj) { // amount in cents
//   balanced.get(bankObj.href).credit(amount).then(function(credit) {
//     // console.log(credit);
//   },
//   function(err) {
//     // console.log(err);
//   });
// };

// balanced.marketplace.bank_accounts.create(bankFormObj).credit({
//     'amount': 5000,
//     'appears_on_statement_as': 'githelp.co',
//     'description': 'githelp.co'
//   }).then(function(credit) {
//     // console.log('CREDIT TO BANK ACCT', credit.toJSON());
//   },
//   function(err) {
//     // console.log(err);
//   });




