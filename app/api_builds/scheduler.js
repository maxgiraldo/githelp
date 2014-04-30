var googleapis = require('googleapis'),
    request = require('request'),
    moment = require('moment'),
    mailer = require('./mailer'),
    Q = require('q'),
    googleAuth = require('google-oauth-jwt');

var mongoose = require('mongoose');
var User = mongoose.model('User');


var TokenCache = googleAuth.TokenCache,
    tokens = new TokenCache();

var attendeesObj = function(apptObj) {
  var deferred = Q.defer();
  // console.log('custObj', apptObj.customer);
  User.find({$or: [{_id: apptObj.customer},{_id: apptObj.merchant}]}, function(err, users) {
    if(err) {
      console.log(err);
      deferred.reject(err);
    }
    // console.log('users', users);
    deferred.resolve(users);
  });
  return deferred.promise;
};

exports.getConfirmedDate = function(apptObj) {
  for (var k in apptObj.date) {
    if(apptObj.date[k].confirmed) {
      return apptObj.date[k].date;
    }
  }
};

exports.sendEventInvite = function(appt){
  Appointment.findOne({_id: appt._id}).populate('merchant').populate('customer').exec(function(err, apptObj){
    var confirmedDate = exports.getConfirmedDate(apptObj);
    var startTime = moment.utc(confirmedDate).toISOString();
    // var startTime = moment.utc(apptObj.time).toISOString();
    console.log('startTime', startTime);

    var endTime = moment.utc(confirmedDate).add('minutes', apptObj.duration).toISOString();
    // var endTime = moment(startTime).add('minutes', apptObj.duration).toDate();
    // var startDate = moment(apptObj.date).format('YYYY-MM-DD');
    // var endDate = moment(apptObj.date).format('YYYY-MM-DD');
    console.log('endTime', endTime);
    var topic = apptObj.topic;
    console.log('apptObj in sendEventInvite: ', apptObj);

    attendeesObj(apptObj).then(function(users) { // add a .fail case later
      console.log('attendees', users[0].email, users[1].email);
      var attendees = [
        {'email': users[0].email},
        {'email': users[1].email}
      ];

      tokens.get({
        // use the email address of the service account, as seen in the API console (gitsomehelp@gmail.com)
        email: '1062441697172-btqgv7qv73qi7pa4mscn26rih20oc1e9@developer.gserviceaccount.com',
        // use the PEM file we generated from the downloaded key
        keyFile: 'google_secret.pem',
        // specify the scopes you wish to access
        scopes: ['https://www.googleapis.com/auth/calendar']
      }, function (err, token) {
        if(err) {console.log(err);}
        console.log('token?', token);
        var urlObj = {
          method: 'POST',
          uri: 'https://www.googleapis.com/calendar/v3/calendars/1062441697172-btqgv7qv73qi7pa4mscn26rih20oc1e9@developer.gserviceaccount.com/events?sendNotifications=true&access_token='+token,
          json: {  // not body
            "end": {
              // "date": endDate, //yyyy-mm-dd
              "dateTime": endTime
              // "timeZone": "America/New_York" // optional
            },
            "start": {
              // "date": startDate, //yyyy-mm-dd date optional if have dateTime
              "dateTime": startTime
              // "timeZone": "America/New_York" // optional
            },
            "attendees": attendees, // array of objects with email as key
            "creator": {
              email: 'wainetam@gmail.com',
              displayName: 'githelp.co'
            },
            "source": {
              title: 'Event details on githelp.co',
              url: 'http://www.githelp.co' // add link to githelp session_id; needs to be live link
            },
            "summary": '**githelp Session** ' + apptObj.merchant.github.login + ' <> ' + apptObj.customer.github.login,
            "description": apptObj.message + " Visit http://www.githelp.co/#!/appointments/ for appointment details" // description body in event
          }
        };
        request(urlObj, function(err, response, body) { // request takes an object w parameters: method, uri
          if(err || response.statusCode !== 200) {
            console.log('Request error.');
            console.log(err);
          }
          console.log('BODY?', body);
        });
      });
    });
  })
};
// http://stackoverflow.com/questions/15648644/google-calendar-api-request-not-going-through-with-node-js-express-request-l

exports.convertJStoUnixTime = function(jsDateObj) {
  return jsDateObj.getTime()/1000;
};

exports.convertUnixToGoogTime = function(jsDateObj) {
  // return convertJStoUnixTime(jsDateObj)
};
