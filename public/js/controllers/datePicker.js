angular.module('githelp.controllers.datePicker', [])
  .controller('DatepickerCtrl', ['$scope', '$http', '$location', '$state', '$stateParams', 'Global',
    function($scope, $http, $location, $state, $stateParams, Global) {
      $scope.global = Global;

      var appointmentId = $stateParams.sessionId;


      // on first trip, it's the merchant
      // but if merchant's suggested times aren't accepted, window.location is then customer
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
        },
        appointmentId: appointmentId || null
      };

      // $scope.proposedAppt = {
      //   appointmentId: appointmentId
      // };

      $scope.apptInDb;

      $scope.loadAppointment = function() {
        $http.post('/appointment/show', $scope.appts).success(function(response) {
          console.log('LOAD', response);
          $scope.apptInDb = response;
        });
      };

      $scope.editAppointment = function() {
        $http.post('/edit/appointment', $scope.appts).success(function(response) {
          $location.path('/appointments');
          console.log('EDIT', response);
        });
      };

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
