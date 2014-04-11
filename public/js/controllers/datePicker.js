angular.module('githelp.controllers.datePicker', [])
  .controller('DatepickerCtrl', ['$scope', '$http', '$location', '$state', '$stateParams', 'Global',
    function($scope, $http, $location, $state, $stateParams, Global) {
      $scope.global = Global;

      var appointmentId = $stateParams.sessionId;

      var userName = window.location.hash.replace(/..\//, "").replace(/\/.*$/, ""); // whatever is after hash bang

      // on first trip, it's the merchant
      // but if merchant's suggested times aren't accepted, window.location is then customer
      $scope.appts = {
        merchant: userName,
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

      $scope.confirmedDate;

      $scope.loadAppointment = function() {
        $http.post('/appointment/show', $scope.appts).success(function(response) {
          console.log('LOAD', response);
          $scope.apptInDb = response;
          $scope.confirmedDate = response.confirmedDate;
        });
      };

      $scope.editAppointment = function() {
        $http.post('/appointment/edit', $scope.appts).success(function(response) {
          $location.path('/appointments');
          console.log('EDIT', response);
        });
      };

      $scope.createAppointment = function() {
        $http.post('/appointment/create', $scope.appts).success(function(response) {
          $scope.apptComplete = response;
          console.log('BOOKING', response);
          console.log($scope.appts);
          $location.path('/inbox');
        });
      };

      $scope.confirmOption1 = function() {
        $http.get('/appointments/confirm/' + userName + '/' + appointmentId + '/option1').success(function(response) {
          console.log('confirmed option1', response);
          $location.path('/appointments');
        });
      };

      $scope.confirmOption2 = function() {
        $http.get('/appointments/confirm/' + userName + '/' + appointmentId + '/option2').success(function(response) {
          console.log('confirmed option2', response);
          $location.path('/appointments');
        });
      };

      $scope.confirmOption3 = function() {
        $http.get('/appointments/confirm/' + userName + '/' + appointmentId + '/option3').success(function(response) {
          console.log('confirmed option3', response);
          $location.path('/appointments');
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
