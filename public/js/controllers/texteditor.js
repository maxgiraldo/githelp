'use strict';

angular.module('githelp.controllers.texteditor', [])
 .controller('TextEditorController', ['$scope', '$state', '$http', '$stateParams', 'Global',
    function ($scope, $state, $http, $stateParams, Global) {
    $scope.global = Global;
    $scope.returnedFiles = [];
    // Text Editor
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    var firepadRef = new Firebase('https://githelp.firebaseio.com/');

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
        firepad.setText('//function go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
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
      // $http.post('upload', fd,
      // {
      //   transformRequest:angular.identity,
      //   headers:{'Content-Type': undefined}

      // })
      .success(function(arr) {
        $scope.returnedFiles = arr;
        firepad.setText($scope.returnedFiles[0].data);
      })
    };

    // $scope.storeCurrentPage = function() {
    //   var lines = Document.get
    // };
  }]);

// 'use strict';

// angular.module('githelp.controllers.texteditor', [])
//  .controller('TextEditorController', ['$scope', '$state', '$http', '$stateParams', 'Global',
//     function ($scope, $state, $http, $stateParams, Global) {
//     $scope.global = Global;
//     $scope.returnedFiles = [];
//     // Text Editor
//     //////////////////////////////////////////////
//     //////////////////////////////////////////////
//     //////////////////////////////////////////////
//     var firepadRef = new Firebase('https://githelp.firebaseio.com/');

//     //// Create ACE
//     var editor = ace.edit("firepad-container");
//     editor.setTheme("ace/theme/twilight");
//     var session = editor.getSession();
//     session.setUseWrapMode(true);
//     session.setUseWorker(false);
//     session.setMode("ace/mode/javascript");

//     //// Create Firepad.
//     var firepad = Firepad.fromACE(firepadRef, editor);
//     //// Initialize contents.
//     firepad.on('ready', function() {
//       if (firepad.isHistoryEmpty()) {
//         firepad.setText('//function go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
//       };
//     });

//     // File Upload
//     //////////////////////////////////////////////
//     //////////////////////////////////////////////
//     //////////////////////////////////////////////
//     $scope.filesChanged = function(elm) {
//       $scope.files = elm.files;
//       $scope.$apply();
//     };
//     $scope.upload = function() {
//       var fd = new FormData();
//       angular.forEach($scope.files, function(file) {
//         fd.append('file', file);
//       });
//       $http({
//         method: 'POST',
//         url: 'upload',
//         data: fd,
//         headers: {'Content-Type': undefined},
//         transformRequest: angular.identity,
//         params: {numFiles: $scope.files.length}
//       })
//       // $http.post('upload', fd,
//       // {
//       //   transformRequest:angular.identity,
//       //   headers:{'Content-Type': undefined}

//       // })
//       .success(function(arr) {
//         $scope.returnedFiles = arr;
//         firepad.setText($scope.returnedFiles[0].data);
//       })
//     };

//   }]);
