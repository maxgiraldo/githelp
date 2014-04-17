angular.module('githelp.controllers.messages', [])
  .controller('MessageController', [
    '$scope',
    '$location',
    '$state',
    '$stateParams',
    'Global',
    'Message',
    'Socks',
    function($scope, $location, $state, $stateParams, Global, Message, Socks){
      $scope.global = Global;
      // var sock = new SockJS('/echo');

      $scope.messagesByUser = {};
      $scope.messagesByChatroom = {};
      $scope.membersByChatroom = {};


      $scope.createMessage = function(){
        var newMessage = new Message({
          content: this.content,
          chatroomId: $stateParams.inboxId
          // somehow find the chatroomId
        });
        this.content = '';

        newMessage.$save(function(message){
          // sock.send(JSON.stringify(message));
        })
      };

      var sock = new Socks('inbox');
      sock.init();

      // sock.onopen = function() {
      //   console.log('open');
      // };

      // sock.onmessage = function(e) {
      //   $scope.currentChatroomId = $stateParams.inboxId;
      //   if($scope.messagesByChatroom[$stateParams.inboxId] instanceof Array){
      //     $scope.messagesByChatroom[$stateParams.inboxId].push(JSON.parse(e.data));
      //   } else{
      //     $scope.messagesByChatroom[$stateParams.inboxId] = [JSON.parse(e.data)];
      //   }
      //   $scope.$apply();
      // };

      // sock.onclose = function() {
      //   console.log('sockjs close');
      // };

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