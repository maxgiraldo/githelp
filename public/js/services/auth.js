angular.module('githelp.services.auth', []).factory('Auth', ['$location', 'redirectToUrlAfterLogin',
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

// app.factory('githelp.services.auth', function ($location,  $cookies, api, redirectToUrlAfterLogin) {
//   return {
//     login: function (credentials) {
//       return api.login(credentials);
//     },
//     isLoggedIn: function() {
//       return !!$cookies.FPSSO; //convert value to bool
//     },
//     saveAttemptUrl: function() {
//       if($location.path().toLowerCase() != '/login') {
//         redirectToUrlAfterLogin.url = $location.path();
//       }
//       else
//         redirectToUrlAfterLogin.url = '/';
//     },
//     redirectToAttemptedUrl: function() {
//       $location.path(redirectToUrlAfterLogin.url);
//     }
//   };
// });


