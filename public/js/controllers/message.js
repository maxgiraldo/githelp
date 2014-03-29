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
          chatroomId: $stateParams.chatroomId
          // somehow find the chatroomId
        })
        $scope.content = ''

        newMessage.$save(function(message){
          sock.send(JSON.stringify(message));
        })
      };

      sock.onopen = function() {
        console.log('open');
      };

      sock.onmessage = function(e) {
        $scope.currentChatroomId = $stateParams.chatroomId;
        if($scope.messagesByChatroom[$stateParams.chatroomId] instanceof Array){
          $scope.messagesByChatroom[$stateParams.chatroomId].push(JSON.parse(e.data));
        } else{
          $scope.messagesByChatroom[$stateParams.chatroomId] = [JSON.parse(e.data)];
        }
        $scope.$apply();
      };

      sock.onclose = function() {
        console.log('sockjs close');
      };


// make this real time

      $scope.findMessages = function(){
        Message.get({
          chatroomId: $stateParams.chatroomId
          // this shouldn't be stateParams
        },
          function(chatroom){
            console.log('we in the find messages')
            $scope.currentChatroomId = $stateParams.chatroomId;
            // messages and members populated
            $scope.chatroom = chatroom
            console.log(chatroom)
            $scope.membersByChatroom[$stateParams.chatroomId] = chatroom.members;
            $scope.messagesByChatroom[$stateParams.chatroomId] = chatroom.messages;
            console.log('hello');
            console.log($scope.membersByChatroom[$stateParams.chatroomId]);
        })
      };
    }
  ])