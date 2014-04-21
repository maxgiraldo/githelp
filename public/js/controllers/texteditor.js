'use strict';

angular.module('githelp.controllers.texteditor', [])
 .controller('TextEditorController', ['$scope', '$state', '$http', '$stateParams', 'Global', '$firebase', 'FIREBASE_URL', 'Socks', 'Tokbox',
    function ($scope, $state, $http, $stateParams, Global, $firebase, FIREBASE_URL, Socks, Tokbox) {



    $scope.sessionId = $stateParams.sessionId;
    var firepadRef = new Firebase(FIREBASE_URL + $scope.sessionId);
    $scope.global = Global;
    $scope.sameNameCollection = {};
    $scope.allFiles = {};
    $scope.textEditorVisible = true;
    $scope.session = $firebase(firepadRef);
    $scope.fileCount = 0;
    $scope.currentSessionData;
    $scope.currentSessionId;

    var counter = 0

    // Service to enable TokBox library
    Tokbox();

    // This will be used to keep track of which files correspond to which Firepad containers

    //
    var fileSock = function(sockType, id){
      Socks.call(this, sockType, id);
    };
    fileSock.prototype = Object.create(Socks.prototype);

    fileSock.prototype.event_file = function(messageData){
      var files = messageData;
      files.forEach(function(file) {
        $scope.fileCount++;

        if (file.name in $scope.allFiles) {
          $scope.sameNameCollection[file.name]++;
          var newFileName = file.name + $scope.sameNameCollection[file.name];
          $scope.allFiles[file.name] = newFileName;
        } else {
          $scope.sameNameCollection[file.name] = 0;
          $scope.allFiles[file.name] = file;
        }
        $scope.allFiles[file.name].active = true;
        $scope.allFiles[file.name].fileCount = $scope.fileCount;
        $scope.session.$add($scope.allFiles[file.name])
        .then(function(ref) {
          $scope.allFiles[file.name]._id = ref.name();
        });
      }) //files.forEach
      var oldFileData = firepad.getText();
      var oldFileRef = new Firebase(FIREBASE_URL + $scope.sessionId +'/'+ $scope.currentSessionId);
      oldFileRef.update({data: oldFileData});

      $scope.currentSessionId = files[0]._id;
      firepad.setText(files[0].data);
      editor.gotoLine(0,0,true);
      $scope.$apply();
    };

    fileSock.prototype.event_addTab = function(){
      $scope.session.$add({name: 'empty_'+counter, type: 'text/plain', active: true, data: ''});
      counter++;
      $scope.$apply();
    }

    fileSock.prototype.event_removeTab = function(messageData){
      var ref = new Firebase(FIREBASE_URL + $scope.sessionId + '/' +messageData);
      ref.remove();
      for(var file in $scope.allFiles){
        if($scope.allFiles[file]._id === messageData){
          delete $scope.allFiles[file]
        }
      }
      $scope.$apply();
    }

    var fileBot = new fileSock('file', $stateParams.sessionId);
    fileBot.init();

    // Text Editor
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////

    //// Create ACE
    var editor = ace.edit("firepad-container0");
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
        firepad.setText('console.log("hello, world");');
        var currentText = firepad.getText();
        $scope.allFiles['hello_world_example'] = {
          name: 'hello_world.js',
          type: 'text/javascript',
          data: currentText
        }
        $scope.session.$add($scope.allFiles['hello_world_example'])
        .then(function(ref) {
          $scope.allFiles['hello_world_example']._id = ref.name();
          $scope.currentSessionId = ref.name();
        });
      };
    });

    // FILE FUNCTIONS
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

    $scope.goToFile = function(_id) {
      var file = $scope.session.$child(_id);
      var oldFileData = firepad.getText();
      var oldFileRef = new Firebase(FIREBASE_URL + $scope.sessionId +'/'+ $scope.currentSessionId);
      oldFileRef.update({data: oldFileData});
      firepad.setText(file.data);

      $scope.currentSessionId = _id;
      // var myRe = /text[/]/g;
      // var fileFormat = file.type.replace(myRe, '');
      // session.setMode("ace/mode/" + fileFormat);
    };

    $scope.removeTab = function(_id){
      fileBot.sockjs_send('removeTab', _id);
    };

    $scope.addTab = function(){
      fileBot.sockjs_send('addTab');
    };
    // $scope.showTab = function(file){
    //   $scope.allFiles[file.name].active = !$scope.allFiles[file.name].active;
    // };

    // $scope.storeCurrentPage = function() {
    //   var lines = Document.get
    // };

    // VIDEO/AUDIO CALLS
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

