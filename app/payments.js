var balanced = require('balanced-official');

balanced.configure('ak-test-1dsNimzLa65kRDXzRzGgLQ5Gqoi8sIwCU');

var customer = balanced.marketplace.customers.create();

var card = balanced.marketplace.cards.create({
    'number': '4111111111111111',
    'expiration_year': '2016',
    'expiration_month': '12',
     'cvv': '123'
});

card.associate_to_customer(customer)
    .debit(5000)
    .then(function (debit) {
        // save the result of the debit
    }, function (err) {
        // record the error message
    });;
