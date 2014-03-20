angular.module('githelp.controllers.navbar', [])
  .controller('NavbarController', ['$scope', 'Global',
    function ($scope, Global) {
    $scope.global = Global;
  }
]);
