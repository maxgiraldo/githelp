'use strict';

// Save unique session to Firebase
app.factory('Session',
  function($firebase, FIREBASE_URL) {
    var ref = new Firebase(FIREBASE_URL + 'sessions');
    var sessions = $firebase(ref);

    var Session = {
      all: sessions,
      create: function(session) {
        return sessions.$add(session);
      },
      find: function(sessionId) {
        return sessions.$child(sessionId);
      },
      delete: function(sessionId) {
        return sessions.$remove(sessionId);
      },
      createTextEditor: function(sessionId, textEditor) {
        return sessions.$child(sessionId).$child('texteditors').$add(textEditor);
      }
    };

    return Session;
});