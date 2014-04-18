'use strict';

angular.module('githelp.controllers.texteditor', [])
 .controller('TextEditorController', ['$scope', '$state', '$http', '$stateParams', 'Global', '$firebase', 'FIREBASE_URL', 'Socks',
    function ($scope, $state, $http, $stateParams, Global, $firebase, FIREBASE_URL, Socks) {

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

    // $scope.showTab = function(file){
    //   $scope.returnedFiles[file.name].active = !$scope.returnedFiles[file.name].active;
    // };

    // $scope.storeCurrentPage = function() {
    //   var lines = Document.get
    // };
  }]);

