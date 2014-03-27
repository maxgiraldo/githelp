angular.module('githelp.controllers.messages', [])
  .controller('MessageController', [
    '$scope',
    '$location',
    '$state',
    '$stateParams',
    'Global',
    'Message',
    function($scope, $location, $state, Global, Message){
      $scope.global = Global;

      $scope.messagesByUser = {};

      $scope.createMessage = function(){
        var newMessage = new Message({
          content: $scope.content,
          sender: $scope.user._id,
          chatroom: $scope.chatroom_id
          // somehow find the chatroomId
        })

        newMessage.$save(function(data){
          $scope.messagesByUser[$scope.global.userName]
          console.log(data);
        })
      };

// make this real time

      $scope.findMessages = function(){
        Message.get({
          chatroomId: $stateParams.chatroomId;
          // this shouldn't be stateParams
        },
          function(chatroom){
            // messages and members populated
            $scope.members = chatroom.members;
            $scope.messages = chatroom.messages;
        })
      };
    }
  ])