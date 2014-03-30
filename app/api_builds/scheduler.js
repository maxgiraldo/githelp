var googleapis = require('googleapis'),
    request = require('request'),
    moment = require('moment'),
    mailer = require('./mailer'),
    Q = require('q');

var auth = new googleapis.OAuth2Client();

auth.setCredentials({
  access_token: 'ya29.1.AADtN_WwyQ0HoLKd4qi7CLVD1cVpDMTP4MMsqKXNIcV6nt8eZcAqUpt_sR2Mvc-msC7Vgg',
  refresh_token: '1/ps2RpwRSLOyegnHQ7YgNJOM2mHpxnRIS476a2hmNseM'
});

// console.log('AUTH', auth);

exports.sendEventInvite = function(apptObj, done){
  var startTime = apptObj.time;
  var endTime = moment(startTime).add('minutes', apptObj.duration).toDate();
  var startDate = moment(apptObj.date).format('YYYY-MM-DD');
  var endDate = moment(apptObj.date).format('YYYY-MM-DD');
  var topic = apptObj.topic;

  mailer.attendeesEmail(apptObj).then(function(users) { // add a .fail case later
    console.log('attendees', users);
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
            "date": endDate, //yyyy-mm-dd
            "dateTime": endTime
          },
          "start": {
            "date": startDate, //yyyy-mm-dd
            "dateTime": startTime
          },
          "attendees": attendees, // array of objects with email as key
          "creator": {
            email: 'wainetam@gmail.com',
            displayName: 'githelp.co'
          },
          "source": {
            title: 'Event details on githelp.co',
            url: 'http://www.google.com' // add link to githelp session_id
          },
          "summary": topic, // TITLE
          "description": '' // description body in event
        }
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
