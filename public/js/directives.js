'use strict';

angular.module('githelp.directives.fileinput', [])
  .directive('fileInput', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        alert('hi');
        elm.bind('change', function() {
          $parse(attrs.fileInput)
          .assign(scope, elm[0].files);
          scope.$apply();
        })
      }
    }
  }
]);

angular.module('githelp.directives.initFocus', [])
  .directive('initFocus', function() {
    var timer;

    return function(scope, elm, attr) {
        if (timer) clearTimeout(timer);

        timer = setTimeout(function() {
            elm.focus();
            console.log('focus', elm);
        }, 0);
    };
  });

angular.module('githelp.directives.enterPress', [])
  .directive('enterPress', function() {
    return function(scope, element) {
      element.on('keyup', function(e) {
        if (e.which == 13 && ! e.shiftKey) {
          element.submit();
          return false;
        }
      });
    };
  })
angular.module('githelp.directives.editInPlace', [])
  .directive('editInPlace', function() {
    return {
      restrict: 'E',
      scope: true,
      template: '<span ng-click="edit()">${{user.ppm}}/min<span ng-hide="user._id !== global.user._id"><i id="edit" class="username fa fa-pencil"></i></span></span><input ng-model="user.ppm"></input>',
      link: function ( scope, element, attrs ) {
        // Let's get a reference to the input element, as we'll want to reference it.
        var inputElement = angular.element( element.children()[1] );

        // This directive should have a set class so we can style it.
        element.addClass( 'edit-in-place' );

        // Initially, we're not editing.
        scope.editing = false;

        // ng-click handler to activate edit-in-place
        scope.edit = function () {
          scope.editing = true;

          // We control display through a class on the directive itself. See the CSS.
          element.addClass( 'active' );

          // And we must focus the element.
          // `angular.element()` provides a chainable array, like jQuery so to access a native DOM function,
          // we have to reference the first element in the array.
          inputElement[0].focus();
            // When we leave the input, we're done editing.

        };
        inputElement.bind( 'blur', function() {
            scope.submitEdit();
            scope.editing = false;
            element.removeClass( 'active' );
          });
      }
    };
  });
