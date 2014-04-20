'use strict';

angular.module('githelp.controllers.texteditor', [])
 .controller('TextEditorController', ['$scope', '$state', '$http', '$stateParams', 'Global', '$firebase', 'FIREBASE_URL', 'Socks', 'Tokbox',
    function ($scope, $state, $http, $stateParams, Global, $firebase, FIREBASE_URL, Socks, Tokbox) {

    // Service to enable TokBox library
    Tokbox();

    //
    var fileSock = function(sockType, id){
      Socks.call(this, sockType, id);
    };
    fileSock.prototype = Object.create(Socks.prototype);

    fileSock.prototype.event_file = function(messageData){
      var files = messageData;
      files.forEach(function(file) {
        if (file.name in $scope.returnedFiles) {
          $scope.sameNameCollection[file.name]++;
          var newFileName = file.name + $scope.sameNameCollection[file.name];
          $scope.returnedFiles[file.name] = newFileName;
        } else {
          $scope.sameNameCollection[file.name] = 0;
          $scope.returnedFiles[file.name] = file;
        }
        $scope.returnedFiles[file.name].active = true;
        $scope.session.$add($scope.returnedFiles[file.name])
        .then(function(ref) {
          // var textEditor = $scope.session.$child(ref.name());
          // textEditor.$set({'_id': ref.name()});
          $scope.returnedFiles[file.name]._id = ref.name();
        });

      }) //files.forEach
      firepad.setText(files[0].data);
      $scope.$apply();
    };

    var counter = 0
    fileSock.prototype.event_addTab = function(){
      // create new files here
      // add to existing firepad
      var ref = new Firebase(FIREBASE_URL + $scope.sessionId);
      ref.set({name: 'empty_'+counter, type: 'text/plain', active: true, data: ''});
      $scope.returnedFiles[ref.name] = ref;
      counter++;
      $scope.$apply();
    }

    fileSock.prototype.event_removeTab = function(messageData){
      var ref = new Firebase(FIREBASE_URL + $scope.sessionId + '/' +messageData);
      ref.remove();
      for(var file in $scope.returnedFiles){
        console.log($scope.returnedFiles[file]._id);
        console.log(messageData);
        if($scope.returnedFiles[file]._id === messageData){
          console.log("hello removing tabs")
          delete $scope.returnedFiles[file]
        }
      }
      $scope.$apply();
    }

    var fileBot = new fileSock('file', $stateParams.sessionId);
    fileBot.init();

    $scope.global = Global;
    $scope.sameNameCollection = {};
    $scope.returnedFiles = {};

    // Text Editor
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////

    //// Create session to hold text editors in Firebase
    $scope.sessionId = $stateParams.sessionId;
    // var sessionRef = new Firebase(FIREBASE_URL + $scope.sessionId);
    var firepadRef = new Firebase(FIREBASE_URL + $scope.sessionId);

    $scope.session = $firebase(firepadRef);

    //// Create ACE
    var editor = ace.edit("firepad-container");
    editor.setTheme("ace/theme/twilight");
    var session = editor.getSession();
    session.setUseWrapMode(true);
    session.setUseWorker(false);
    session.setMode("ace/mode/javascript");

    //// Create Firepad.
    var firepad = Firepad.fromACE(firepadRef, editor);

    //// Initialize contents.
    firepad.on('ready', function() {
      if (firepad.isHistoryEmpty()) {
        firepad.setText('function sayHello(name) {\n  return "Hello, " + name;\n}');
      };
    });

    // File Upload
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    $scope.filesChanged = function(elm) {
      $scope.files = elm.files;
      $scope.$apply();
    };
    $scope.upload = function() {
      var fd = new FormData();
      angular.forEach($scope.files, function(file) {
        fd.append('file', file);
      });
      $http({
        method: 'POST',
        url: 'upload',
        data: fd,
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity,
        params: {numFiles: $scope.files.length}
      })
      .success(function(files) {
        fileBot.sockjs_send('file', files);
      }) // success
    };

    // editorSock.onopen = function() {
    //   console.log('open');
    // };

    // editorSock.onmessage = function(e) {
    //   var files = JSON.parse(e.data);
    //   files.forEach(function(file) {
    //     if (file.name in $scope.returnedFiles) {
    //       $scope.sameNameCollection[file.name]++;
    //       var newFileName = file.name + $scope.sameNameCollection[file.name];
    //       $scope.returnedFiles[file.name] = newFileName;
    //     } else {
    //       $scope.sameNameCollection[file.name] = 0;
    //       $scope.returnedFiles[file.name] = file;
    //     }
    //     $scope.returnedFiles[file.name].active = true;
    //     $scope.session.$add($scope.returnedFiles[file.name])
    //     .then(function(ref) {
    //       // var textEditor = $scope.session.$child(ref.name());
    //       // textEditor.$set({'_id': ref.name()});
    //       $scope.returnedFiles[file.name]._id = ref.name();
    //     });

    //   }) //files.forEach
    //   firepad.setText(files[0].data);
    //   $scope.$apply();
    // };

    $scope.goToFile = function(_id) {
      var file = $scope.session.$child(_id);
      firepad.setText(file.data);
    };

    $scope.removeTab = function(_id){
      fileBot.sockjs_send('removeTab', _id);
    }

    $scope.addTab = function(){
      fileBot.sockjs_send('addTab');
    }
    // $scope.showTab = function(file){
    //   $scope.returnedFiles[file.name].active = !$scope.returnedFiles[file.name].active;
    // };

    // $scope.storeCurrentPage = function() {
    //   var lines = Document.get
    // };

    // Video/Audio Calls
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    var sessionId = "2_MX40NDcwOTUxMn5-U3VuIEFwciAyMCAxNDoyMDoyNyBQRFQgMjAxNH4wLjEzNjM0OTI2flB-";
    var apiKey = '44709512';
    var token = 'T1==cGFydG5lcl9pZD00NDcwOTUxMiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz0zNzhlYzE1YjlhYTJlMjZhNjZkMmNmNzVhMzI2YWU4Y2ExZDNlYjc1OnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9Ml9NWDQwTkRjd09UVXhNbjUtVTNWdUlFRndjaUF5TUNBeE5Eb3lNRG95TnlCUVJGUWdNakF4Tkg0d0xqRXpOak0wT1RJMmZsQi0mY3JlYXRlX3RpbWU9MTM5ODAyOTE5MSZub25jZT0wLjM5MDE2MDYzNDg3NDA3OTA0JmV4cGlyZV90aW1lPTE0MDA2MjA4MjQmY29ubmVjdGlvbl9kYXRhPQ==';

    // var defaultWidth = 264;
    // var defaultWidthSm = 132;
    var defaultWidth = 214;
    var defaultWidthSm = 132;
    var defaultHeight = 168;
    var defaultHeightSm = 99;

    // var publisher = TB.initPublisher(apiKey, 'opentokVideos');
    var session = TB.initSession(sessionId);
    var publisher = TB.initPublisher(apiKey,
                                   "videos",
                                   {width:defaultWidth, height:defaultHeight});

    publisher.publishVideo(false);
  // $scope.audioOnly = function() {
  //   $scope.videoEnabled = false;
  //   $(videos).hide();
  //   publisher.publishVideo(false);
  // }
  // $scope.enableVideo = function() {
  //   $scope.videoEnabled = true;
  //   publisher.publishVideo(true);
  //   $(videos).show();
  // };
  // var subscriber = session.subscribe(stream,
  //                                  "videos",
  //                                  {width:100, height:100});

      // Event Listeners: enable the OpenTok controller to send events to JavaScript functions
      var subscribeToStreams = function(streams) {
        for (var i = 0; i < streams.length; i++) {
          var stream = streams[i];
          if (stream.connection.connectionId != session.connection.connectionId) {
              session.subscribe(stream, 'videos2', {width:defaultWidth, height:defaultHeight});
          }
        }
      }  // These functions rely on ^ subscribeToStreams
          var sessionConnectedHandler = function(event) {
            subscribeToStreams(event.streams);
            session.publish(publisher);
          }

          var streamCreatedHandler = function(event) {
            subscribeToStreams(event.streams);
          }

      session.addEventListener("sessionConnected", sessionConnectedHandler);

      // Initialize Video Chat Session
      // $scope.startVideoChat = function() {
        session.connect(apiKey, token);
      // }


      // Watch for streams that are added to the session
      session.addEventListener("streamCreated", streamCreatedHandler);

      // a = new TBStart('44708602', 'opentokVideos');
      // a.startVideo();


  }]);

