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


      // Tom's shit
      $scope.appt = {
        dt: "",
        time: ""
      };
      var counter = 0;
      $scope.idArray = ["first", "second", "third"];
      $scope.otherArray = ["first", "second", "third"];
      $scope.addDate = function(){
        console.log($scope.appt);
        if(counter > 2){
          console.log("no");
        } else{
          var num = $scope.otherArray.shift();
          $scope.appts[num] = {};
          $scope.appts[num].dt = $scope.appt.dt;
          $scope.appts[num].time = $scope.appt.time;
          counter++;
        }
      };

      $scope.deleteDate = function(id){
        counter--;
        delete $scope.appts[id];
        $scope.otherArray.push(id)
        $scope.$apply();
      };
      // Tom's shit


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

      // $scope.createAppointment = function() {
      //   console.log($scope.appts)
      //   $http.post('/create/appointment', $scope.appts).success(function(response) {
      //     $scope.apptComplete = response;
      //     console.log('BOOKING', response);
      //     console.log($scope.appts);
      //     $location.path('/inbox');
      //   });
      // };

      $scope.today = function() {
        // $scope.appt.dt = new Date();
        $scope.appt.dt = new Date();
        // $scope.appts.first.dt = new Date();
        // $scope.appts.second.dt = new Date();
        // $scope.appts.third.dt = new Date();
      };

      $scope.today();

      // // Disable weekend selection
      // $scope.disabled = function(date, mode) {
      //   return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      // };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      // $scope.open1 = function($event) {
      //   $event.preventDefault();
      //   $event.stopPropagation();
      //   $scope.opened1 = true;
      // };

      // $scope.open2 = function($event) {
      //   $event.preventDefault();
      //   $event.stopPropagation();
      //   $scope.opened2 = true;
      // };

      // $scope.open3 = function($event) {
      //   $event.preventDefault();
      //   $event.stopPropagation();
      //   $scope.opened3 = true;
      // };

      $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
      $scope.format = $scope.formats[2];


    }
]);
