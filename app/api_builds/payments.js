var balanced = require('balanced-official'),
    Q = require('q');

balanced.configure('ak-test-1dsNimzLa65kRDXzRzGgLQ5Gqoi8sIwCU');

// var customer = balanced.marketplace.customers.create();

// console.log('CUSTOMER ', customer);

var cardFormObj = {
  'number': '4111111111111111',
  'expiration_year': '2016',
  'expiration_month': '12',
  'cvv': '123'
  // ,
  // 'address': {
    // 'line1': '965 Mission St',
    // 'postal_code': '94103'
  // }
};

var bankFormObj = {
  'routing_number': '121000358',
  'account_type': 'checking',
  'name': 'Johann Bernoulli',
  'account_number': '9900000001'
};

exports.createCreditCard = function(cardFormObj) {
  var deferred = Q.defer();
  balanced.marketplace.cards.create(cardFormObj)
  .then(function(card) {
    deferred.resolve(card);
    console.log('CARD ', card.toJSON());
  }, function(err) {
    deferred.reject(err);
    console.log(err);
  });
  return deferred.promise;
};

// exports.createCreditCard(cardFormObj);

exports.createBankAccount = function(bankFormObj) {
  var deferred = Q.defer();
  balanced.marketplace.bank_accounts.create(bankFormObj)
  .then(function(account) {
    deferred.resolve(account);
    console.log('ACCOUNT ', account.toJSON());
  }, function(err) {
    deferred.resolve(err);
    console.log(err);
  });
  return deferred.promise;
};

// exports.createBankAccount(bankFormObj);

// 965 Mission St  94103 AVS street matches

// or balanced.get(cardURI).debit()

var associateCardToCustomer = function(cardObj, customerObj) {
  var deferred = Q.defer();
  balanced.get(cardObj.href).associate_to_customer(customerObj.href).then(function(obj) {
    deferred.resolve(obj);
  }, function(err) {
    console.log(err);
    deferred.reject(err);
  });
  return deferred.promise;
};

var debitCard = function(cardObj, customerObj) {
  associateCardToCustomer(cardObj, customerObj).debit({
      'amount': 5000,
      'appears_on_statement_as': 'githelp.co',
      'description': 'githelp.co'
    }).then(function (debit) {
        // save the result of the debit
      console.log('debit', debit.toJSON());
      // console.log('card', debit._api.objects);
    }, function (err) {
        // record the error message
      console.log(err);
    });
};

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

balanced.marketplace.cards.create(cardFormObj).associate_to_customer(customerObj).debit({
    'amount': 5000,
    'appears_on_statement_as': 'githelp.co',
    'description': 'githelp.co'
  }).then(function(debit) {
    console.log('debit', debit.toJSON());
  }, function(err) {
    console.log(err);
  });

var creditBankAccount = function(bankObj) {
  balanced.get(bankObj.href).credit(5000).then(function(credit) {
    console.log(credit);
  },
  function(err) {
    console.log(err);
  });
};

balanced.marketplace.bank_accounts.create(bankFormObj).credit({
    'amount': 5000,
    'appears_on_statement_as': 'githelp.co',
    'description': 'githelp.co'
  }).then(function(credit) {
    console.log('CREDIT TO BANK ACCT', credit.toJSON());
  },
  function(err) {
    console.log(err);
  });


