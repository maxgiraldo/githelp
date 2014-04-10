angular.module('githelp.controllers.texteditor', [])
  .controller('TextEditorController', ['$scope', 'Global',
    function ($scope, Global) {
    $scope.global = Global;

    //// Initialize Firebase.
  setTimeout(function() {
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
  }, 50);


  }
]);
