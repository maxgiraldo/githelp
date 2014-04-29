angular.module('githelp.controllers.timePicker', [])
  .controller('TimepickerCtrl', ['$scope', '$state', 'Global',
    function($scope, $state, Global) {
      $scope.global = Global;
      $scope.appt.time = new Date();
      // $scope.appts.first.time = new Date();
      // $scope.appts.second.time = new Date();
      // $scope.appts.third.time = new Date();
      $scope.hstep = 1;
      $scope.mstep = 15;
      $scope.ismeridian = true;
    }

])
