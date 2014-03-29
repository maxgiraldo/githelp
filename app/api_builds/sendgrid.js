var api_key = 'wainetam14';
var api_user = 'wainetam';

var sendgrid = require('sendgrid')(api_user, api_key);

var params = {
  to: 'wainetam@gmail.com',
  from: 'wainetam@gmail.com'
};

var email = new sendgrid.Email(params);

email.setSubject('Some subject');
email.setHtml('<h1>Some html</h1>');


sendgrid.send(email, function(err, json) {
  if (err) { console.error(err); }
  console.log(json);
});

exports.composeEmail = function(params) {


}


// var html = '
// <h2>You have a new call request</h2>

// ';
