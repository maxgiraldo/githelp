angular.module('githelp.controllers.messages', [])
  .controller('MessageController', [
    '$scope',
    '$location',
    '$state',
    '$stateParams',
    'Global',
    'Message',
    function($scope, $location, $state, $stateParams, Global, Message){
      $scope.global = Global;
      var sock = new SockJS('/echo');

      $scope.messagesByUser = {};
      $scope.messagesByChatroom = {};
      $scope.membersByChatroom = {};

      $scope.createMessage = function(){
        var newMessage = new Message({
          content: $scope.content,
          chatroomId: $stateParams.inboxId
          // somehow find the chatroomId
        });
        $scope.content = '';

        newMessage.$save(function(message){
          sock.send(JSON.stringify(message));
        })
      };

      sock.onopen = function() {
        console.log('open');
      };

      sock.onmessage = function(e) {
        $scope.currentChatroomId = $stateParams.inboxId;
        if($scope.messagesByChatroom[$stateParams.inboxId] instanceof Array){
          $scope.messagesByChatroom[$stateParams.inboxId].push(JSON.parse(e.data));
        } else{
          $scope.messagesByChatroom[$stateParams.inboxId] = [JSON.parse(e.data)];
        }
        $scope.$apply();
      };

      sock.onclose = function() {
        console.log('sockjs close');
      };


      // $scope.findMerchants = function(){

      // }

      // $scope.findCustomer = function(){

      // }


// make this real time

      $scope.findMessages = function(){
        Message.get({
          chatroomId: $stateParams.inboxId
          // this shouldn't be stateParams
        },
          function(chatroom){
            console.log('we in the find messages');
            $scope.currentChatroomId = $stateParams.inboxId;
            // messages and members populated
            $scope.chatroom = chatroom;
            console.log(chatroom);
            $scope.membersByChatroom[$stateParams.inboxId] = chatroom.members;
            $scope.messagesByChatroom[$stateParams.inboxId] = chatroom.messages;
            console.log('hello');
            console.log($scope.membersByChatroom[$stateParams.inboxId]);
        })
      };
    }
  ])