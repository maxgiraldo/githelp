angular.module('githelp.controllers.texteditor', [])
  .controller('TextEditorController', ['$scope', '$upload', 'Global',
    function ($scope, Global, $upload) {

    $scope.global = Global;

    // File Upload
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    //////////////////////////////////////////////
    $scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload = $upload.upload({
        url: '/upload',
        method: 'POST',
        // headers: {'header-key': 'header-value'},
        data: {myObj: $scope.myModelObj},
        file: file
      }).success(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      });
    }

  };

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
        firepad.setText('// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
      };
    });


  }
]);
