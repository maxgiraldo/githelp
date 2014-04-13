'use strict';

angular.module('githelp.controllers.texteditor', [])
 .controller('TextEditorController', ['$scope', '$state', '$http', '$stateParams', 'Global',
    function ($scope, $state, $http, $stateParams, Global) {
    $scope.global = Global;
    $scope.sameNameCollection = {};
    $scope.returnedFiles = {};

    // Text Editor
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////

    //// Unique sessions
    $scope.sessionId = $stateParams.sessionId;
    $scope.currentFile = '';

    // $scope.createNewFile = function(x) {
    //   var firepadRef = new Firebase('https://githelp.firebaseio.com/' + $scope.sessionId + $scope.returnedFiles[x].name);
    // };

    var firepadRef = new Firebase('https://githelp.firebaseio.com/' + $scope.sessionId);
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
        // Add files to returnedFile as they come in
        // If duplication occurs, add numbers after copies
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
        })
        // Return the first file in obj
        firepad.setText(files[0].data);

      }) // success
    };

    // $scope.showTab = function(file){
    //   $scope.returnedFiles[file.name].active = !$scope.returnedFiles[file.name].active;
    // };

    // $scope.storeCurrentPage = function() {
    //   var lines = Document.get
    // };
  }]);

