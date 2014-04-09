angular.module('githelp.controllers.datePicker', [])
  .controller('DatepickerCtrl', ['$scope', '$http', '$location', '$state', 'Global',
    function($scope, $http, $location, $state, $stateParams, Global) {
      $scope.global = Global;

      $scope.appts = {
        merchant: window.location.hash.replace(/..\//, "").replace(/\/.*$/, ""),
        message: "",
        duration: "15",
        first: {
          dt: "",
          time: ""
        },
        second: {
          dt: "",
          time: ""
        },
        third: {
          dt: "",
          time: ""
        }
      };

      // $scope.appt = {
      //   duration: "15",
      //   dt: "",
      //   time: "",
      //   message: "",
      //   merchant: window.location.hash.replace(/..\//, "").replace(/\/.*$/, "")
      // };

      $scope.createAppointment = function() {
        $http.post('/create/appointment', $scope.appts).success(function(response) {
          $scope.apptComplete = response;
          console.log('BOOKING', response);
          console.log($scope.appts);
          $location.path('/inbox');
        });
      };


      $scope.today = function() {
        // $scope.appt.dt = new Date();
        $scope.appts.first.dt = new Date();
        $scope.appts.second.dt = new Date();
        $scope.appts.third.dt = new Date();
      };

      $scope.today();

      // // Disable weekend selection
      // $scope.disabled = function(date, mode) {
      //   return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      // };

      $scope.open1 = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened1 = true;
      };

      $scope.open2 = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened2 = true;
      };

      $scope.open3 = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened3 = true;
      };

      $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
      $scope.format = $scope.formats[2];


    }
]);
