// This works

angular.module('githelp.controllers.appointment', [])
  .controller('AppointmentController', ['$scope', '$state', '$location', 'Global', '$http', 'Appointment', '$stateParams', '$filter', 'Socks',
    function ($scope, $state, $location, Global, $http, Appointment, $stateParams, $filter, Socks) {

      var timeSock = function(sockType, id){
        Socks.call(this, sockType, id);
      };
      timeSock.prototype = Object.create(Socks.prototype);

      timeSock.prototype.event_time = function(messageData){
        console.log(messageData);
        $scope.timerByAppointment[messageData].timerOn = true;
        $scope.timerByAppointment[messageData].seconds++;
        $scope.timerByAppointment[messageData].totalSeconds++;
        if ($scope.timerByAppointment[messageData].seconds === 60) {
          $scope.timerByAppointment[messageData].totalMinutes++;
          $scope.timerByAppointment[messageData].minutes++;
          $scope.timerByAppointment[messageData].seconds = 0;
        } else if ($scope.timerByAppointment[messageData].minutes === 60) {
          $scope.timerByAppointment[messageData].hours++;
          $scope.timerByAppointment[messageData].totalHours++;
          $scope.timerByAppointment[messageData].minutes = 0;
        }
        $scope.timerByAppointment[messageData].totalAmount = $scope.timerByAppointment[messageData].merchantPrice * ($scope.timerByAppointment[messageData].totalSeconds / 60.0);
        $scope.$apply();
      };

      timeSock.prototype.event_close = function(messageData){
        console.log('event_close', messageData);
        if ($scope.timerByAppointment[messageData].timerId) { clearInterval($scope.timerByAppointment[messageData].timerId)};
        $scope.timerByAppointment[messageData].totalAmount = $scope.timerByAppointment[messageData].merchantPrice * ($scope.timerByAppointment[messageData].totalSeconds / 60.0);
        console.log($scope.timerByAppointment[messageData].totalAmount, $scope.timerByAppointment[messageData].totalSeconds, $scope.timerByAppointment[messageData].merchantPrice);
        // $scope.amountToCharge = $filter('currency')($scope.totalAmount, '$');
        // console.log('$scopeamounttocharge', $scope.amountToCharge);
        $scope.$apply();
      };

      var timeBot = new timeSock('time', $stateParams.sessionId);
      timeBot.init();

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
            console.log(timeBot);
            timeBot.sockjs_send('time', $scope.appointmentId);
          }, 1000);
        };

        $scope.stopTimer = function() {
          console.log('stop timer function')
          console.log(timeBot);
          timeBot.sockjs_close('close', $scope.appointmentId);

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
