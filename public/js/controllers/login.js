angular.module('githelp.controllers.login', [])
  .controller('LoginController', [
    '$scope',
    '$http',
    '$location',
    'redirectToUrlAfterLogin',
    'Global',
    function ($scope, $http, $location, redirectToUrlAfterLogin, Global) {
      $scope.global = Global;
      $scope.lastUrl = redirectToUrlAfterLogin.url;
    }
]);
