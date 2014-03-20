angular.module('githelp.controllers.index', [])
  .controller('IndexController', ['$scope', 'Global',
    function ($scope, Global) {
    $scope.global = Global;
  }
]);
