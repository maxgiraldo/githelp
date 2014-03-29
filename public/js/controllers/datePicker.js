angular.module('githelp.controllers.datePicker', [])
  .controller('DatepickerCtrl', ['$scope', '$state', 'Global',
    function($scope, $state, Global) {
      $scope.today = function() {
        $scope.appt.dt = new Date();
      };

      $scope.today();

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
      $scope.format = $scope.formats[2];
    }
]);