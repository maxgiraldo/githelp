// This works

angular.module('githelp.controllers.appointment', [])
  .controller('AppointmentController', ['$scope', '$state', '$location', 'Global', '$http', 'Appointment', '$stateParams', '$filter',
    function ($scope, $state, $location, Global, $http, Appointment, $stateParams, $filter) {
      $scope.global = Global;

  $scope.appointmentId = $stateParams.sessionId;


  // $scope.displayConfirmation = function() {
  //   $http.post('/appointments/' + appointmentId, appointmentId).success(function(response) {
  //   })
  // };

  $scope.confirmAppointment = function(){
    var newAppointment = new Appointment({
      appointmentId: $scope.appointmentId
    });
    newAppointment.$save(function(data){
      console.log("we confirmed the appointment!")
      $location.path('/appointments');
    });
  };

  var appointmentSock = new SockJS('/echo');
  $scope.timerByAppointment = {};

  $scope.liveSession = function() {
    // Create new object key by appointmentId if it doesn't already exist
    if( 'Object' !== typeof $scope.timerByAppointment[$scope.appointmentId]){
      $scope.timerByAppointment[$scope.appointmentId] = {};
    }
    // TIMER
    // Initialize timer variables
    $scope.timerByAppointment[$scope.appointmentId].timerId      = 0;
    $scope.timerByAppointment[$scope.appointmentId].totalSeconds = 0;
    $scope.timerByAppointment[$scope.appointmentId].totalMinutes = 0;
    $scope.timerByAppointment[$scope.appointmentId].totalHours   = 0;
    $scope.timerByAppointment[$scope.appointmentId].seconds      = 0;
    $scope.timerByAppointment[$scope.appointmentId].minutes      = 0;
    $scope.timerByAppointment[$scope.appointmentId].hours        = 0;

    // Set Default Merchant Price
    $scope.timerByAppointment[$scope.appointmentId].merchantPrice = 2.50;

    $scope.timerByAppointment[$scope.appointmentId].totalAmount = 0;

    $scope.timerByAppointment[$scope.appointmentId].timerOn = false;

    $scope.startTimer = function() {
      $scope.timerByAppointment[$scope.appointmentId].timerId = setInterval(function() {
        appointmentSock.send($scope.appointmentId);
      }, 1000);
    };

    appointmentSock.onopen = function() {
      console.log('open');
    };

    appointmentSock.onmessage = function(e) {
      $scope.timerByAppointment[e.data].timerOn = true;
      $scope.timerByAppointment[e.data].seconds++;
      $scope.timerByAppointment[e.data].totalSeconds++;
      if ($scope.timerByAppointment[e.data].seconds === 60) {
        $scope.timerByAppointment[e.data].totalMinutes++;
        $scope.timerByAppointment[e.data].minutes++;
        $scope.timerByAppointment[e.data].seconds = 0;
      } else if ($scope.timerByAppointment[e.data].minutes === 60) {
        $scope.timerByAppointment[e.data].hours++;
        $scope.timerByAppointment[e.data].totalHours++;
        $scope.timerByAppointment[e.data].minutes = 0;
      }
      $scope.timerByAppointment[e.data].totalAmount = $scope.timerByAppointment[e.data].merchantPrice * ($scope.timerByAppointment[e.data].totalSeconds / 60.0);
      $scope.$apply();
    };

    appointmentSock.onclose = function(e) {
      console.log(e.data);
      if ($scope.timerByAppointment[e.data].timerId) { clearInterval($scope.timerByAppointment[e.data].timerId)};
      $scope.timerByAppointment[e.data].totalAmount = $scope.timerByAppointment[e.data].merchantPrice * ($scope.timerByAppointment[e.data].totalSeconds / 60.0);
      console.log($scope.timerByAppointment[e.data].totalAmount, $scope.timerByAppointment[e.data].totalSeconds, $scope.timerByAppointment[e.data].merchantPrice);
      // $scope.amountToCharge = $filter('currency')($scope.totalAmount, '$');
      // console.log('$scopeamounttocharge', $scope.amountToCharge);
      $scope.$apply();
    };

    $scope.stopTimer = function() {
      appointmentSock.close($scope.appointmentId);

      console.log('amt to charge', $scope.totalAmount);
      // alert('inserting' + $scope.totalAmount + 'into your bank account.');

      var transactionObj = {
        amount: ($scope.totalAmount * 100).toFixed(0), // amount needs to be in cents and no decimals
        duration: ($scope.totalSeconds / 60.0).toFixed(0), // duration in minutes
        // sessionId: '5338ae556ea2b600005f68ec'
        sessionId: $scope.appointmentId // contains merchant and customer info
      };

      $http.post('/charge', transactionObj).success(function(response) { // run payments.debitCard
        console.log(response);
        var transactionObj = transactionObj;
      });
    };
      };
     }
]);
