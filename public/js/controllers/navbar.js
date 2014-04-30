angular.module('githelp.controllers.navbar', [])
  .controller('NavbarController', ['$scope', 'Global',
    function ($scope, Global) {
    $scope.global = Global;

    $scope.quickSession = function(){
      alert('tricked you good, this does not do anything yet');
    };
  }
]);
