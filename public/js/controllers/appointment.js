// This works

angular.module('githelp.controllers.appointment', [])
  .controller('AppointmentController', ['$scope', '$state', '$location', 'Global', '$http', 'Appointment', '$stateParams', '$filter',
    function ($scope, $state, $location, Global, $http, Appointment, $stateParams, $filter) {
      $scope.global = Global;

  var appointmentId = $stateParams.sessionId;


  // $scope.displayConfirmation = function() {
  //   $http.post('/appointments/' + appointmentId, appointmentId).success(function(response) {
  //   })
  // };

  $scope.confirmAppointment = function(){
    var newAppointment = new Appointment({
      appointmentId: appointmentId
    });
    newAppointment.$save(function(data){
      console.log("we confirmed the appointment!")
      $location.path('/appointments');
    });
  };

  var appointmentSock = new SockJS('/echo');

  $scope.liveSession = function() {
    // TIMER
    // Initialize timer variables
    $scope.timerId      = 0;
    $scope.totalSeconds = 0;
    $scope.totalMinutes = 0;
    $scope.totalHours   = 0;
    $scope.seconds      = 0;
    $scope.minutes      = 0;
    $scope.hours        = 0;

    // Set Default Merchant Price
    $scope.merchantPrice = 2.50;

    $scope.totalAmount = 0;

    $scope.timerOn = false;

    $scope.startTimer = function() {
      $scope.timerId = setInterval(function() {
        appointmentSock.send("ping");
      }, 1000);
    };

    appointmentSock.onopen = function() {
      console.log('open');
    };

    appointmentSock.onmessage = function(e) {
      $scope.timerOn = true;
      $scope.seconds++;
      $scope.totalSeconds++;
      if ($scope.seconds === 60) {
        $scope.totalMinutes++;
        $scope.minutes++;
        $scope.seconds = 0;
      } else if ($scope.minutes === 60) {
        $scope.hours++;
        $scope.totalHours++;
        $scope.minutes = 0;
      }
      $scope.totalAmount = $scope.merchantPrice * ($scope.totalSeconds / 60.0);
      $scope.$apply();
    };

    appointmentSock.onclose = function() {
      if ($scope.timerId) { clearInterval($scope.timerId)};
      $scope.totalAmount = $scope.merchantPrice * ($scope.totalSeconds / 60.0);
      console.log($scope.totalAmount, $scope.totalSeconds, $scope.merchantPrice);
      // $scope.amountToCharge = $filter('currency')($scope.totalAmount, '$');
      // console.log('$scopeamounttocharge', $scope.amountToCharge);
      $scope.$apply();
    };

    $scope.stopTimer = function() {
      appointmentSock.close();

      console.log('amt to charge', $scope.totalAmount);
      // alert('inserting' + $scope.totalAmount + 'into your bank account.');

      var transactionObj = {
        amount: ($scope.totalAmount * 100).toFixed(0), // amount needs to be in cents and no decimals
        duration: ($scope.totalSeconds / 60.0).toFixed(0), // duration in minutes
        // sessionId: '5338ae556ea2b600005f68ec'
        sessionId: appointmentId // contains merchant and customer info
      };

      $http.post('/charge', transactionObj).success(function(response) { // run payments.debitCard
        console.log(response);
        var transactionObj = transactionObj;
      });
    };
      };
     }
]);
