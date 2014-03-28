var googleapis = require('googleapis'),
    request = require('request');

var auth = new googleapis.OAuth2Client();

auth.setCredentials({
  access_token: 'ya29.1.AADtN_WULK_kjzV1AIM_Zi73-2C-mQuIBDUXQ62SrXs4RQeYvI2VoimkXCIFNe5pxvRZfQ',
  refresh_token: '1/HqxOQubnC4KRuSMTPt3y-zOwc8wIZMBEuJoF5hsQpX0'
});



// console.log('AUTH', auth);

exports.createEvent = function(maxAttendees, endDate, startDate, attendees, done){
  googleapis
  .discover('calendar', 'v3')
  .execute(function(err, client) {
    console.log('CLIENT', client);
    var params = {
      calendarId: 'wainetam@gmail.com',
      maxAttendees: maxAttendees
    };
    var body = {
        "end": {
          "date": endDate
        },
        "start": {
          "date": startDate
        },
        "attendees": attendees,
        "creator": {
          email: 'wainetam@gmail.com',
          displayName: 'githelp.co'
        }
      }
    var req = client.calendar.events.insert(params, body).withAuthClient(auth);
    console.log("REQ", req);
    req.execute(function (err, response) {
      console.log('RESPONSE', response);
      done(response);
    });
  });
}
