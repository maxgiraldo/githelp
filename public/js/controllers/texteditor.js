'use strict';

angular.module('githelp.controllers.texteditor', [])
 .controller('TextEditorController', ['$scope', '$state', '$http', '$modal', '$stateParams', 'Global', '$firebase', 'FIREBASE_URL', 'Socks', 'Tokbox',
    function ($scope, $state, $http, $modal, $stateParams, Global, $firebase, FIREBASE_URL, Socks, Tokbox) {

      // do array and then iterate through and check, delete if it meets
      // the check

    $scope.sessionId = $stateParams.sessionId;
    var firepadRef = new Firebase(FIREBASE_URL + $scope.sessionId);
    $scope.global = Global;
    $scope.sameNameCollection = {};
    $scope.allFiles = [];
    $scope.textEditorVisible = true;
    $scope.session = $firebase(firepadRef);
    $scope.fileCount = 0;
    $scope.currentSessionData;
    $scope.currentSessionId;
    $scope.currentSessionIndex;
    $scope.fireBaseFiles = {};
    $scope.fileIdArray = [];

    // Service to enable TokBox library
    Tokbox();

    // This will be used to keep track of which files correspond to which Firepad containers

    //
    var fileSock = function(sockType, id){
      Socks.call(this, sockType, id);
    };
    fileSock.prototype = Object.create(Socks.prototype);

    fileSock.prototype.event_file = function(messageData){
      $scope.fileCount = 0;
      var files = messageData;
      files.forEach(function(file) {
        file.active = true;
        $scope.allFiles.push(file);
        file.indexNumber = $scope.allFiles.indexOf(file);
        if($scope.fileCount === 0){
          $scope.currentSessionId = file._id;
          $scope.currentSessionIndex = $scope.allFiles.indexOf(file);
        }
        $scope.fileCount++;
        $scope.fileIdArray.push(file._id);
        $scope.fireBaseFiles[file._id] = $scope.session.$child(file._id);

        if($scope.fileCount === files.length){
          editor.gotoLine(0,0,true);
        }
      });
    };

    var counter = 0
    fileSock.prototype.event_addTab = function(messageData){
      var newTabId = messageData._id;
      counter = messageData.counter;
      if($scope.allFiles instanceof Array){
        $scope.allFiles.push(messageData);
        $scope.currentSessionIndex = $scope.allFiles.indexOf(messageData);
      } else{
        $scope.allFiles = [messageData];
        $scope.currentSessionIndex = 0;
      }
      messageData.indexNumber = $scope.allFiles.indexOf(messageData);
      $scope.fireBaseFiles[newTabId] = $scope.session.$child(newTabId);
      $scope.currentSessionId = newTabId;
      $scope.fileIdArray.push(newTabId);
      editor.gotoLine(0,0,true);
      counter++;
    };

    fileSock.prototype.event_removeTab = function(messageData){
      var counter = 0
      $scope.allFiles.forEach(function(file){
        console.log('event_removetab', $scope.allFiles);
        if(file._id === messageData._id){
          $scope.allFiles.splice(counter, 1);
        }
        console.log('event_removetab', $scope.allFiles);
        counter++;
      })
      delete $scope.fireBaseFiles[messageData._id];
      console.log($scope.fireBaseFiles);
      if($scope.fileIdArray.length > 0){
        console.log("removing tab");
        console.log($scope.fileIdArray);
        $scope.fileIdArray.splice($scope.fileIdArray.indexOf(messageData._id), 1);
        console.log($scope.fileIdArray);
        if(!$scope.fileIdArray.length){
          $scope.currentSessionId = undefined;
          $scope.$apply();
        } else{
          $scope.currentSessionId = $scope.fileIdArray[0];
          console.log($scope.allFiles);
          console.log($scope.fireBaseFiles);
          $scope.allFiles.forEach(function(file){
            if(file._id === $scope.currentSessionId){
              $scope.currentSessionIndex = $scope.allFiles.indexOf(file);
              console.log('seeting hte currensession index in removetab', $scope.currentSessionIndex)
              $scope.$apply();
            }
          })
        }
      }
      // from here go to a different tab
    };

    var fileBot = new fileSock('file', $stateParams.sessionId);
    fileBot.init();

    // Text Editor
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////

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
        firepad.setText('console.log("hello world!")');
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
        $scope.fileCount = 0;


        files.forEach(function(file){
          file.active = true;
          $scope.session.$add(file)
            .then(function(ref) {
              file._id = ref.name();
              $scope.fileCount++;
              $scope.fireBaseFiles[file._id] = new Firebase(FIREBASE_URL + $scope.sessionId +'/'+ file._id);
              $scope.fireBaseFiles[file._id].update({data: file.data});
              if($scope.fileCount === files.length){
                firepad.setText(files[0].data);
                fileBot.sockjs_send('file', files);
              }
            });
          });
      }) // success
    };

    fileSock.prototype.event_toFile = function(currentFile){
      if(currentFile._id !== $scope.currentSessionId){
        $scope.fileIdArray.splice($scope.fileIdArray.indexOf($scope.currentSessionId), 1);
        $scope.fileIdArray.unshift($scope.currentSessionId);
        $scope.allFiles.forEach(function(file){
          if(file._id === currentFile._id){
            $scope.currentSessionIndex = $scope.allFiles.indexOf(file);
          }
        })
        $scope.currentSessionId = currentFile._id;
      }
    }

    $scope.goToFile = function(currentFile) {
      var file = $scope.session.$child(currentFile._id);
      var oldFileData = firepad.getText();
      if(currentFile._id !== $scope.currentSessionId){
        $scope.fireBaseFiles[$scope.currentSessionId].$update({data: oldFileData});
        firepad.setText(file.data);
        fileBot.sockjs_send('toFile', currentFile);
      }
      // var myRe = /text[/]/g;
      // var fileFormat = file.type.replace(myRe, '');
      // session.setMode("ace/mode/" + fileFormat);
    };

    $scope.removeTab = function(file){
      console.log('before socket', $scope.fileIdArray);
      $scope.allFiles.forEach(function(f){
        if(f._id === $scope.fileIdArray[0]){
          firepad.setText(f.data);
        }
      })
      fileBot.sockjs_send('removeTab', file);
    };

    $scope.addTab = function(){
      var newTab = {name: 'empty_'+counter, type: 'text/javascript', active: true, data: '', counter: counter}
      if($scope.currentSessionId){
        $scope.allFiles[$scope.currentSessionIndex].data = firepad.getText();
        $scope.fireBaseFiles[$scope.currentSessionId].$update({data: firepad.getText()});
      }
      $scope.session.$add(newTab)
        .then(function(ref){
          newTab._id = ref.name();
          $scope.fireBaseFiles[newTab._id] = new Firebase(FIREBASE_URL + $scope.sessionId +'/'+ newTab._id);
          $scope.fireBaseFiles[newTab._id].update({data: " "});
          firepad.setText(" ");
          fileBot.sockjs_send('addTab', newTab);
        });
    };

    $scope.endSession = function() {
      if(!$scope.global.user.contactEmail || !$scope.global.user.balancedAccount) {
        var modalInstance = $modal.open({
          templateUrl: 'views/partials/endSession.html',
          controller: ModalInstanceController
        });

        modalInstance.result.then(function(message){
          if(message){
            $scope.stopTimer();
          }
        }, function(){
          $log.info('Modal dismissed at: ' + new Date());
        });
      };
    }

    var ModalInstanceController = function($scope, Global, $modalInstance, Message) {
      $scope.closeModal = function(){
        $modalInstance.close();
      };

      $scope.stopTimer = function(){
        $modalInstance.close('stopTimer');
      }
    }
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

