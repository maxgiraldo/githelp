angular.module('githelp.services.auth', [])
  .factory('Auth', ['$location', 'redirectToUrlAfterLogin',
    function($location, redirectToUrlAfterLogin) {
      return {
        saveAttemptUrl: function() {
          if($location.path().toLowerCase() !== '/signin') {
            redirectToUrlAfterLogin.url = $location.path();
          } else {
            redirectToUrlAfterLogin.url = '/';
          }
        },
        redirectToAttemptedUrl: function() {
          $location.path(redirectToUrlAfterLogin.url);
        }
      };
    }
]);
