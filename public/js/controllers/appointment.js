// This works

angular.module('githelp.controllers.appointment', [])
  .controller('AppointmentController', ['$scope', '$state', '$location', 'Global', '$http', 'Appointment', '$stateParams', '$filter', 'Socks',
    function ($scope, $state, $location, Global, $http, Appointment, $stateParams, $filter, Socks) {

      var timeSock = function(sockType, id){
        Socks.call(this, sockType, id);
      };
      timeSock.prototype = Object.create(Socks.prototype);

      timeSock.prototype.event_time = function(message){
        $scope.timerByAppointment[message._id].timerOn = true;
        $scope.timerByAppointment[message._id].seconds++;
        $scope.timerByAppointment[message._id].totalSeconds++;
        if ($scope.timerByAppointment[message._id].seconds === 60) {
          $scope.timerByAppointment[message._id].totalMinutes++;
          $scope.timerByAppointment[message._id].minutes++;
          $scope.timerByAppointment[message._id].seconds = 0;
        } else if ($scope.timerByAppointment[message._id].minutes === 60) {
          $scope.timerByAppointment[message._id].hours++;
          $scope.timerByAppointment[message._id].totalHours++;
          $scope.timerByAppointment[message._id].minutes = 0;
        }
        $scope.timerByAppointment[message._id].totalAmount = $scope.timerByAppointment[message._id].merchantPrice * ($scope.timerByAppointment[message._id].totalSeconds / 60.0);
        $scope.$apply();
      };

      timeSock.prototype.event_close = function(message){
        if ($scope.timerByAppointment[message._id].timerId) { clearInterval($scope.timerByAppointment[message._id].timerId)};
        $scope.timerByAppointment[message._id].totalAmount = $scope.timerByAppointment[message._id].merchantPrice * ($scope.timerByAppointment[message._id].totalSeconds / 60.0);
        console.log($scope.timerByAppointment[message._id].totalAmount, $scope.timerByAppointment[message._id].totalSeconds, $scope.timerByAppointment[message._id].merchantPrice);
        $scope.totalAmount = $scope.timerByAppointment[message._id].totalAmount;
        $scope.totalSeconds = $scope.timerByAppointment[message._id].totalSeconds;
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
          $location.path('/appointments');
        });
      };

      var appointmentSock = new SockJS('/echo');
      $scope.timerByAppointment = {};

      $scope.liveSession = function() {
        var appointmentId = $stateParams.sessionId;
        $http.get('/appointment/initialize/' + appointmentId).success(function(appointment) {
          // Create new object key by appointmentId if it doesn't already exist
          console.log('appointmentObj', appointment);
          $scope.appointmentId = appointment._id;
          if( 'Object' !== typeof $scope.timerByAppointment[appointment._id]){
            $scope.timerByAppointment[appointment._id] = {};
          }
          // TIMER
          // Initialize timer variables
          $scope.timerByAppointment[appointment._id].timerId      = 0;
          $scope.timerByAppointment[appointment._id].totalSeconds = 0;
          $scope.timerByAppointment[appointment._id].totalMinutes = 0;
          $scope.timerByAppointment[appointment._id].totalHours   = 0;
          $scope.timerByAppointment[appointment._id].seconds      = 0;
          $scope.timerByAppointment[appointment._id].minutes      = 0;
          $scope.timerByAppointment[appointment._id].hours        = 0;

          // Set Default Merchant Price
          $scope.timerByAppointment[appointment._id].merchantPrice = parseInt(appointment.apptppm);
          console.log('parseInt', parseInt(appointment.apptppm));
          console.log('merchant price', $scope.timerByAppointment[appointment._id].merchantPrice); //NaN

          $scope.timerByAppointment[appointment._id].totalAmount = 0;

          $scope.timerByAppointment[appointment._id].timerOn = false;

          $scope.startTimer = function() {
            $scope.timerByAppointment[appointment._id].timerId = setInterval(function() {
              console.log(timeBot);
              timeBot.sockjs_send('time', appointment);
            }, 1000);
          };

          $scope.stopTimer = function() {
            console.log('stop timer function');
            console.log(timeBot);
            timeBot.sockjs_close('close', appointment);

            console.log('amt to charge', $scope.timerByAppointment[appointment._id].totalAmount);
            // alert('inserting' + $scope.totalAmount + 'into your bank account.');

            var transactionObj = {
              amount: ($scope.timerByAppointment[appointment._id].totalAmount * 100).toFixed(0), // amount needs to be in cents and no decimals
              duration: ($scope.timerByAppointment[appointment._id].totalSeconds / 60.0).toFixed(0), // duration in minutes
              // sessionId: '5338ae556ea2b600005f68ec'
              sessionId: $scope.appointmentId // contains merchant and customer info
            };

            console.log('transactionObj', transactionObj);

            $http.post('/charge', transactionObj).success(function(response) { // run payments.debitCard
              console.log(response);
              var transactionObj = transactionObj;
              $location.path('/appointments');
            });
          };
        })
      };
     }
]);
