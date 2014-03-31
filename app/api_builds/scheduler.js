var googleapis = require('googleapis'),
    request = require('request'),
    moment = require('moment'),
    mailer = require('./mailer'),
    Q = require('q');

var auth = new googleapis.OAuth2Client();

auth.setCredentials({
  access_token: 'ya29.1.AADtN_V5k2GoxjVseHRoHzEzeVMJf8lv9FRVSnhUG9T2sciYYlmzPXdUFJyNv6DhZp6XLZQ',
  refresh_token: '1/avW6alyUFB41zUsFCabHcg1dAzQWzozEPmPHqbH_gz4'
});

// console.log('AUTH', auth);

exports.sendEventInvite = function(apptObj, done){
  var startTime = moment.utc(apptObj.time).toISOString();
  console.log('startTime', startTime);
  var endTime = moment.utc(apptObj.time).add('minutes', apptObj.duration).toISOString();
  // var endTime = moment(startTime).add('minutes', apptObj.duration).toDate();
  // var startDate = moment(apptObj.date).format('YYYY-MM-DD');
  // var endDate = moment(apptObj.date).format('YYYY-MM-DD');
  console.log('endTime', endTime);
  var topic = apptObj.topic;

  mailer.attendeesObj(apptObj).then(function(users) { // add a .fail case later
    console.log('attendees', users[0].email, users[1].email);
    var attendees = [
      {'email': users[0].email},
      {'email': users[1].email}
    ];
    // console.log('attendees', attendees);

    googleapis
    .discover('calendar', 'v3')
    .execute(function(err, client) {
      console.log('CLIENT', client);
      var params = {
        calendarId: 'wainetam@gmail.com',
        maxAttendees: attendees.length,
        sendNotifications: true
      };
      var body = {
          "end": {
            // "date": endDate, //yyyy-mm-dd
            "dateTime": endTime,
            "timeZone": "America/New_York" // optional
          },
          "start": {
            // "date": startDate, //yyyy-mm-dd date optional if have dateTime
            "dateTime": startTime,
            "timeZone": "America/New_York" // optional
          },
          "attendees": attendees, // array of objects with email as key
          "creator": {
            email: 'wainetam@gmail.com',
            displayName: 'githelp.co'
          },
          "source": {
            title: 'Event details on githelp.co',
            url: 'http://www.google.com' // add link to githelp session_id; needs to be live link
          },
          "summary": topic || "", // TITLE
          "description": "" // description body in event
        };
      var req = client.calendar.events.insert(params, body).withAuthClient(auth);
      console.log("REQ", req);
      req.execute(function (err, response) {
        if(err) {console.log(err);}
        console.log('RESPONSE', response);
        // done(response);
      });
    });
  });

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
