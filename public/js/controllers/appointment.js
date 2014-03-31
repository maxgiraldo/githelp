// This works

angular.module('githelp.controllers.appointment', [])
  .controller('AppointmentController', ['$scope', '$state', '$stateParams', 'Global', '$http', 'Appointment',
    function ($scope, $state, $stateParams, Global, $http, Appointment) {
      // $scope.global = Global;

  $scope.confirmAppointment = function(){
    var newAppointment = new Appointment({
      appointmentId: $stateParams.appointmentId
    });
    newAppointment.$save(function(data){
      console.log("we confirmed the appointment!")
    });
  };

  var appointmentSock = new SockJS('/echo');

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
    console.log('sockjs close');
  };



  $scope.stopTimer = function() {
    if ($scope.timerId) { clearInterval($scope.timerId)};
    $scope.totalAmount = $scope.merchantPrice * ($scope.totalSeconds / 60.0);
    $scope.$apply();
    $scope.amountToCharge = $scope.totalAmount;
    alert('inserting' + $scope.amountToCharge + 'into your bank account.');

    var txDescription = '';
    console.log('amt to charge', $scope.amountToCharge);

    var transaction = {
      amount: $scope.amountToCharge,
      appointmentId: req.params.appointmentId // contains merchant and customer info
    };

    $http.post('/payments/charge', transaction).success(function(response) { // run payments.debitCard
      console.log(response);
      $scope.txComplete = response;
    });
  };

  // VIDEO CHAT
  var sessionId = "2_MX40NDcwOTUxMn5-V2VkIE1hciAyNiAxODoxMDowNCBQRFQgMjAxNH4wLjI0Nzk5MTI2fg";
  var apiKey = '44709512';
  var token = 'T1==cGFydG5lcl9pZD00NDcwOTUxMiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz0yMjMyMzk4MzMwYzljNzI3MDc0MzQ2ZGY0NmJiYjEyYzM3YTEwODViOnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9Ml9NWDQwTkRjd09UVXhNbjUtVjJWa0lFMWhjaUF5TmlBeE9Eb3hNRG93TkNCUVJGUWdNakF4Tkg0d0xqSTBOems1TVRJMmZnJmNyZWF0ZV90aW1lPTEzOTU4ODI2MzAmbm9uY2U9MC45NTcyNzQxNDI1NTUxMjI2JmV4cGlyZV90aW1lPTEzOTg0NzQ1MDAmY29ubmVjdGlvbl9kYXRhPQ==';

  var defaultWidth = 264;
  var defaultWidthSm = 132;
  var defaultHeight = 198;
  var defaultHeightSm = 99;

  // var publisher = TB.initPublisher(apiKey, 'opentokVideos');
  var session = TB.initSession(sessionId);
  var publisher = TB.initPublisher(apiKey,
                                 "videos",
                                 {width:defaultWidth, height:defaultHeight});
  // var subscriber = session.subscribe(stream,
  //                                  "videos",
  //                                  {width:100, height:100});

      // Event Listeners: enable the OpenTok controller to send events to JavaScript functions
      var subscribeToStreams = function(streams) {
        for (var i = 0; i < streams.length; i++) {
          var stream = streams[i];
          if (stream.connection.connectionId != session.connection.connectionId) {
              session.subscribe(stream, 'videos2', {width:defaultWidth, height:defaultHeight});
          }
        }
      }  // These functions rely on ^ subscribeToStreams
          var sessionConnectedHandler = function(event) {
            subscribeToStreams(event.streams);
            session.publish(publisher);
          }

          var streamCreatedHandler = function(event) {
            subscribeToStreams(event.streams);
          }

      session.addEventListener("sessionConnected", sessionConnectedHandler);

      // Initialize Video Chat Session
      // $scope.startVideoChat = function() {
        session.connect(apiKey, token);
      // }


      // Watch for streams that are added to the session
      session.addEventListener("streamCreated", streamCreatedHandler);

      // a = new TBStart('44708602', 'opentokVideos');
      // a.startVideo();

  //// FIREPAD
    // window.onload = function() {
      //// Initialize Firebase.
      setTimeout(function() {
        var firepadRef = new Firebase('https://githelp.firebaseio.com/');

        //// Create ACE
        var editor = ace.edit("firepad-container");
        editor.setTheme("ace/theme/monokai");
        var session = editor.getSession();
        session.setUseWrapMode(true);
        session.setUseWorker(false);
        session.setMode("ace/mode/javascript");

        //// Create Firepad.
        var firepad = Firepad.fromACE(firepadRef, editor);

        //// Initialize contents.
        firepad.on('ready', function() {
          if (firepad.isHistoryEmpty()) {
            firepad.setText('// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}');
          }
        });
      }, 50);

   }
]);
