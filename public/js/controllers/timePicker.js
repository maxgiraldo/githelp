angular.module('githelp.controllers.timePicker', [])
  .controller('TimepickerController', ['$scope', '$state', 'Global',
    function($scope, $state, Global) {
      $scope.appt.time = new Date();
      $scope.hstep = 1;
      $scope.mstep = 30;

      $scope.ismeridian = true;
    }

])