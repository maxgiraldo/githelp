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

//server side auth
// googleAuth.authenticate({
tokens.get({
  // use the email address of the service account, as seen in the API console
  email: '1062441697172-btqgv7qv73qi7pa4mscn26rih20oc1e9@developer.gserviceaccount.com',
  // use the PEM file we generated from the downloaded key
  keyFile: 'google_secret.pem',
  // specify the scopes you wish to access
  scopes: ['https://www.googleapis.com/auth/calendar']
}, function (err, token) {
  if(err) {console.log(err);}
  console.log('token?', token);

});

//clientside auth

// var auth = new googleapis.OAuth2Client();

// auth.setCredentials({
//   access_token: 'ya29.1.AADtN_V5k2GoxjVseHRoHzEzeVMJf8lv9FRVSnhUG9T2sciYYlmzPXdUFJyNv6DhZp6XLZQ',
//   refresh_token: '1/avW6alyUFB41zUsFCabHcg1dAzQWzozEPmPHqbH_gz4'
// });


// console.log('AUTH', auth);

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

exports.sendEventInvite = function(apptObj, done){
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

  attendeesObj(apptObj).then(function(users) { // add a .fail case later
    console.log('attendees', users[0].email, users[1].email);
    var attendees = [
      {'email': users[0].email},
      {'email': users[1].email}
    ];
    // console.log('attendees', attendees);
    tokens.get({
      // use the email address of the service account, as seen in the API console
      email: '1062441697172-btqgv7qv73qi7pa4mscn26rih20oc1e9@developer.gserviceaccount.com',
      // use the PEM file we generated from the downloaded key
      keyFile: 'google_secret.pem',
      // specify the scopes you wish to access
      scopes: ['https://www.googleapis.com/auth/calendar']
    }, function (err, token) {
      if(err) {console.log(err);}
      console.log('token?', token);
      var urlObj = {
        uri: 'https://www.googleapis.com/calendar/v3/calendars/gitsomehelp@gmail.com/events?access_token='+token,
        // body: {
        //   "end": {
        //     // "date": endDate, //yyyy-mm-dd
        //     "dateTime": endTime,
        //     "timeZone": "America/New_York" // optional
        //   },
        //   "start": {
        //     // "date": startDate, //yyyy-mm-dd date optional if have dateTime
        //     "dateTime": startTime,
        //     "timeZone": "America/New_York" // optional
        //   },
        //   "attendees": attendees, // array of objects with email as key
        //   "creator": {
        //     email: 'wainetam@gmail.com',
        //     displayName: 'githelp.co'
        //   },
        //   "source": {
        //     title: 'Event details on githelp.co',
        //     url: 'http://www.google.com' // add link to githelp session_id; needs to be live link
        //   },
        //   "summary": topic || "", // TITLE
        //   "description": "" // description body in event
        // },
        // headers: {
        //   sendNotifications: true
        // }
      };

      request(urlObj, function(err, response, body) { // request takes an object w parameters: method, uri
        if(err && response.statusCode !== 200) {
          console.log('Request error.');
        }
        console.log('BODY?', body);
      });

    });
  });





  //   googleapis
  //   .discover('calendar', 'v3')
  //   .execute(function(err, client) {
  //     console.log('CLIENT', client);
  //     var params = {
  //       calendarId: 'wainetam@gmail.com',
  //       maxAttendees: attendees.length,
  //       sendNotifications: true
  //     };
  //     var body = {
  //         "end": {
  //           // "date": endDate, //yyyy-mm-dd
  //           "dateTime": endTime,
  //           "timeZone": "America/New_York" // optional
  //         },
  //         "start": {
  //           // "date": startDate, //yyyy-mm-dd date optional if have dateTime
  //           "dateTime": startTime,
  //           "timeZone": "America/New_York" // optional
  //         },
  //         "attendees": attendees, // array of objects with email as key
  //         "creator": {
  //           email: 'wainetam@gmail.com',
  //           displayName: 'githelp.co'
  //         },
  //         "source": {
  //           title: 'Event details on githelp.co',
  //           url: 'http://www.google.com' // add link to githelp session_id; needs to be live link
  //         },
  //         "summary": topic || "", // TITLE
  //         "description": "" // description body in event
  //       };
  //     var req = client.calendar.events.insert(params, body).withAuthClient(auth);
  //     console.log("REQ", req);
  //     req.execute(function (err, response) {
  //       if(err) {console.log(err);}
  //       console.log('RESPONSE', response);
  //       // done(response);
  //     });
  //   });
  // });

};

// exports.createCalEvent(2, '2014-03-31', '2014-03-31', [{'email': 'jollytracker@gmail.com'}]);

// exports.sendConfirm = function() {

// };

exports.convertJStoUnixTime = function(jsDateObj) {
  return jsDateObj.getTime()/1000;
};

exports.convertUnixToGoogTime = function(jsDateObj) {
  // return convertJStoUnixTime(jsDateObj)
};
