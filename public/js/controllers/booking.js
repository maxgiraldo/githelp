angular.module('githelp.controllers.booking', [])
  .controller('BookingController', ['$scope', 'Global',
    function ($scope, Global) {
    $scope.global = Global;
    alert('hello test booking');
  }
]);
