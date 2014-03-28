var request = require('request');



var options = {
  url: 'https://www.googleapis.com/calendar/v3/calendars/jihokoo@gmail.com/events',
  method: "POST",
  form: {
   "end": {
      "date": "2014-03-30"
    },
    "start": {
      "date": "2014-03-29"
    },
    "attendees": [
      {
        "email": "jikoo92@gmail.com"
      }
    ],
    "reminders": {
      "useDefault": true
    }
  },
  qs: {
    key: 'AIzaSyCgCOyTMISbEu7u4gg_J6WhR5NillaaSvo',
    access_token: 'ya29.1.AADtN_XoNSuOQFfitJXEgSam8bCayvisuhvjQmvNpLwjS8vYR0STH0aNPqdZLShx92gk',
    maxAttendees: 5,
    sendNotifications: true
  }
};


request(options, function(a, b, c){
  console.log('hello');
  console.log(a);
  console.log(b);
  console.log(c);
})